import { supabase, auth as supabaseAuth, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase";
import { userStore } from "./localStore";

const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  !SUPABASE_URL.includes("placeholder-url") &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes("placeholder-anon-key")
);

async function hashLocalPassword(email, password) {
  const input = `${email.toLowerCase().trim()}:${password}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function toAuthUser(u) {
  if (!u) return null;
  const meta = u.user_metadata || u.meta || {};
  return {
    id: u.id,
    email: u.email || "",
    displayName: meta.display_name || u.displayName || u.email?.split("@")[0] || "Learner",
    avatarUrl: meta.avatar_url || u.avatarUrl || null,
    accountType: meta.account_type || u.accountType || "learner",
    schoolId: meta.school_id || u.schoolId || null,
    username: meta.username || meta.auth_username || u.username || null
  };
}

// Check local cache for immediate synchronous restore on page load
const cachedUser = userStore.getSession();
let state = {
  user: cachedUser ? toAuthUser(cachedUser) : null,
  isLoading: true,
  error: null
};

let subscribers = [];

function notify() {
  const current = getAuthState();
  subscribers.forEach((cb) => {
    try {
      cb(current);
    } catch (e) {
      console.error("[auth] subscriber callback error:", e);
    }
  });
}

export function getAuthState() {
  return { ...state };
}

// Bug #1 Fix: Asynchronously initialize auth state from Supabase session
async function initSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data?.session?.user) {
      const authUser = toAuthUser(data.session.user);
      state = { user: authUser, isLoading: false, error: null };
      userStore.setSession(authUser);
    } else {
      // Fall back to cached local session if offline
      const cached = userStore.getSession();
      state = { user: cached ? toAuthUser(cached) : null, isLoading: false, error: null };
    }
  } catch (e) {
    console.warn("[auth] Failed to retrieve session from Supabase:", e);
    const cached = userStore.getSession();
    state = { user: cached ? toAuthUser(cached) : null, isLoading: false, error: null };
  }
  notify();
}

// Kick off session resolution immediately
void initSession();

export function onAuthChange(cb) {
  subscribers.push(cb);
  cb(getAuthState());

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const authUser = toAuthUser(session.user);
      state = { user: authUser, isLoading: false, error: null };
      userStore.setSession(authUser);
    } else {
      state = { user: null, isLoading: false, error: null };
      userStore.setSession(null);
    }
    notify();
  });

  return () => {
    subscribers = subscribers.filter((c) => c !== cb);
    data?.subscription?.unsubscribe();
  };
}

export async function signIn(email, password) {
  state = { ...state, isLoading: true, error: null };
  notify();
  if (!email || !password) {
    const msg = "Email and password required";
    state = { ...state, isLoading: false, error: msg };
    notify();
    throw new Error(msg);
  }

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAuth.signIn(email, password);
      if (error) throw error;
      if (!data?.user) {
        throw new Error("Sign in failed: no user returned");
      }
      const authUser = toAuthUser(data.user);
      state = { user: authUser, isLoading: false, error: null };
      userStore.setSession(authUser);
      notify();
      return authUser;
    }

    const localUser = userStore.getByEmail(email);
    const pwHash = await hashLocalPassword(email, password);
    if (!localUser || !localUser.passwordHash || localUser.passwordHash !== pwHash) {
      throw new Error("Invalid email or password");
    }
    const authUser = toAuthUser(localUser);
    state = { user: authUser, isLoading: false, error: null };
    userStore.setSession(authUser);
    notify();
    return authUser;
  } catch (err) {
    state = { ...state, isLoading: false, error: err.message || "Sign in failed" };
    notify();
    throw err;
  } finally {
    if (state.isLoading) {
      state = { ...state, isLoading: false };
      notify();
    }
  }
}

export async function signUp(email, password, displayName, opts = {}) {
  state = { ...state, isLoading: true, error: null };
  notify();
  if (!email || !password || !displayName) {
    const msg = "All fields required";
    state = { ...state, isLoading: false, error: msg };
    notify();
    throw new Error(msg);
  }
  if (password.length < 6) {
    const msg = "Password must be at least 6 characters";
    state = { ...state, isLoading: false, error: msg };
    notify();
    throw new Error(msg);
  }

  const meta = {
    display_name: displayName,
    account_type: opts.accountType || "learner",
    school_id: opts.schoolId || null,
    username: opts.username ? opts.username.toLowerCase().trim() : null
  };

  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAuth.signUp(email, password, meta);
      if (error) throw error;
      const user = data?.user ?? null;
      if (!user) {
        throw new Error("Account creation failed: no user returned");
      }
      const authUser = toAuthUser(user);
      userStore.save(authUser);
      if (data?.session) {
        userStore.setSession(authUser);
        state = { user: authUser, isLoading: false, error: null };
      } else {
        state = { user: null, isLoading: false, error: null };
      }
      notify();
      return { user: authUser, session: data?.session || null };
    }

    const existing = userStore.getByEmail(email);
    if (existing) {
      throw new Error("An account with this email already exists on this device");
    }
    const passwordHash = await hashLocalPassword(email, password);
    const localUser = {
      id: "local-" + Date.now(),
      email: email.trim(),
      displayName,
      accountType: opts.accountType || "learner",
      schoolId: opts.schoolId || null,
      username: opts.username ? opts.username.toLowerCase().trim() : null,
      passwordHash,
      created_at: new Date().toISOString()
    };
    userStore.save(localUser);
    const authUser = toAuthUser(localUser);
    userStore.setSession(authUser);
    state = { user: authUser, isLoading: false, error: null };
    notify();
    return { user: authUser, session: { access_token: "local-session" } };
  } catch (err) {
    state = { ...state, isLoading: false, error: err.message || "Sign up failed" };
    notify();
    throw err;
  } finally {
    if (state.isLoading) {
      state = { ...state, isLoading: false };
      notify();
    }
  }
}

export function signOut() {
  void supabaseAuth.signOut();
  userStore.setSession(null);
  state = { user: null, isLoading: false, error: null };
  notify();
}

export async function updateAccountMeta(data) {
  try {
    const { data: res, error } = await supabaseAuth.updateUser({ data });
    if (!error && res?.user) {
      const authUser = toAuthUser(res.user);
      state = { user: authUser, isLoading: false, error: null };
      userStore.setSession(authUser);
      notify();
      return authUser;
    }
  } catch (e) {
    console.warn("[auth] Remote updateUser failed, updating local:", e);
  }

  const current = state.user || userStore.getSession();
  if (current) {
    const updated = {
      ...current,
      displayName: data.display_name || data.name || current.displayName,
      accountType: data.account_type || current.accountType,
      schoolId: data.school_id !== undefined ? data.school_id : current.schoolId,
      username: data.username || data.teacher_username || current.username
    };
    userStore.save(updated);
    userStore.setSession(updated);
    state = { user: toAuthUser(updated), isLoading: false, error: null };
    notify();
    return state.user;
  }
  return null;
}

export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw new Error(error.message);
}
