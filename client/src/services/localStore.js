// Local-first persistent storage engine for SanskritLab
// Resolves auth, schools, classes, teachers, and learning progress completely locally.

const PREFIX = "sanskritlab-local-";
const memoryFallback = new Map();

function getStorage() {
  try {
    if (
      typeof window !== "undefined" &&
      window.localStorage &&
      typeof window.localStorage.getItem === "function" &&
      typeof window.localStorage.setItem === "function"
    ) {
      return window.localStorage;
    }
  } catch {
    // Restricted storage (private mode / sandboxed iframe) — fall back to memoryFallback
  }
  return null;
}

export function localGet(key, fallback = null) {
  const fullKey = PREFIX + key;
  try {
    const storage = getStorage();
    const raw = storage ? storage.getItem(fullKey) : memoryFallback.get(fullKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[localStore] Failed to read ${key}:`, e);
    const raw = memoryFallback.get(fullKey);
    return raw ? JSON.parse(raw) : fallback;
  }
}

export function localSet(key, value) {
  const fullKey = PREFIX + key;
  const serialized = JSON.stringify(value);
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(fullKey, serialized);
      return true;
    }
  } catch (e) {
    console.warn(`[localStore] Failed to write ${key}:`, e);
  }
  memoryFallback.set(fullKey, serialized);
  return true;
}

export function localRemove(key) {
  const fullKey = PREFIX + key;
  memoryFallback.delete(fullKey);
  try {
    const storage = getStorage();
    if (storage) storage.removeItem(fullKey);
  } catch (e) {
    console.warn(`[localStore] Failed to remove ${key}:`, e);
  }
}

export function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------- USER & AUTH STORE ----------------

export const userStore = {
  list: () => localGet("users", []),
  getById: (id) => userStore.list().find((u) => u.id === id) || null,
  getByEmail: (email) => {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return userStore.list().find((u) => u.email?.toLowerCase().trim() === clean) || null;
  },
  save: (user) => {
    const users = userStore.list();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, updated_at: new Date().toISOString() };
    } else {
      users.push({
        ...user,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    localSet("users", users);
    return user;
  },
  getSession: () => localGet("session", null),
  setSession: (user) => {
    if (user) {
      localSet("session", user);
    } else {
      localRemove("session");
    }
  }
};

// ---------------- SCHOOLS & CLASSES STORE ----------------

export const schoolStore = {
  list: () => localGet("schools", []),
  get: (id) => schoolStore.list().find((s) => s.id === id) || null,
  findMy: (ownerEmail) => {
    if (!ownerEmail) return null;
    const clean = ownerEmail.toLowerCase().trim();
    return schoolStore.list().find((s) => s.owner_email?.toLowerCase().trim() === clean) || null;
  },
  create: (data) => {
    const schools = schoolStore.list();
    const id = generateId("school");
    const code = "SCH" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const lab_code = "LAB" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newSchool = {
      id,
      name: data.name || "Sanskrit Vidyalaya",
      city: data.city || "",
      state: data.state || "",
      school_type: data.school_type || "Senior Secondary School",
      owner_email: data.owner_email || "",
      school_code: code,
      short_code: code,
      lab_code,
      status: "active",
      is_active: true,
      created_at: new Date().toISOString(),
      settings: { pronunciation_feedback: true, allow_student_recording: true }
    };
    schools.push(newSchool);
    localSet("schools", schools);
    return newSchool;
  },
  update: (id, updates) => {
    const schools = schoolStore.list();
    const idx = schools.findIndex((s) => s.id === id);
    if (idx >= 0) {
      schools[idx] = { ...schools[idx], ...updates, updated_at: new Date().toISOString() };
      localSet("schools", schools);
      return schools[idx];
    }
    return null;
  },
  classes: {
    list: (schoolId) => localGet(`classes-${schoolId}`, []).filter((c) => c.is_active !== false),
    create: (schoolId, name) => {
      const list = localGet(`classes-${schoolId}`, []);
      const newClass = {
        id: generateId("cls"),
        school_id: schoolId,
        name,
        is_active: true,
        created_at: new Date().toISOString(),
        sections: [{ id: generateId("sec"), name: "A", is_active: true }]
      };
      list.push(newClass);
      localSet(`classes-${schoolId}`, list);
      return newClass;
    },
    deactivate: (schoolId, classId) => {
      const list = localGet(`classes-${schoolId}`, []).filter((c) => c.id !== classId);
      localSet(`classes-${schoolId}`, list);
      return true;
    },
    createSection: (schoolId, classId, name) => {
      const list = localGet(`classes-${schoolId}`, []);
      const cls = list.find((c) => c.id === classId);
      if (!cls) return null;
      const newSection = { id: generateId("sec"), class_id: classId, name, is_active: true, created_at: new Date().toISOString() };
      cls.sections = [...(cls.sections || []), newSection];
      localSet(`classes-${schoolId}`, list);
      return newSection;
    },
    deactivateSection: (schoolId, classId, sectionId) => {
      const list = localGet(`classes-${schoolId}`, []);
      const cls = list.find((c) => c.id === classId);
      if (cls && Array.isArray(cls.sections)) {
        cls.sections = cls.sections.filter((s) => s.id !== sectionId);
        localSet(`classes-${schoolId}`, list);
      }
      return true;
    }
  },
  teachers: {
    list: (schoolId) => localGet(`teachers-${schoolId}`, []).filter((t) => t.status !== "inactive"),
    create: (schoolId, data) => {
      const list = localGet(`teachers-${schoolId}`, []);
      const newTeacher = {
        id: generateId("tch"),
        school_id: schoolId,
        name: data.name || "Acharya",
        email: data.email || "",
        auth_username: data.auth_username || null,
        status: "active",
        created_at: new Date().toISOString()
      };
      list.push(newTeacher);
      localSet(`teachers-${schoolId}`, list);
      return newTeacher;
    },
    deactivate: (schoolId, teacherId) => {
      const list = localGet(`teachers-${schoolId}`, []).map((t) =>
        t.id === teacherId ? { ...t, status: "inactive", updated_at: new Date().toISOString() } : t
      );
      localSet(`teachers-${schoolId}`, list);
      return true;
    }
  },
  students: {
    list: (schoolId) => localGet(`students-${schoolId}`, []).filter((s) => s.status !== "inactive" && s.is_active !== false),
    create: (schoolId, data) => {
      const list = localGet(`students-${schoolId}`, []);
      const newStudent = {
        id: generateId("stu"),
        school_id: schoolId,
        name: data.name || "Shishya",
        roll_no: data.roll_no || data.roll_number || "",
        roll_number: data.roll_number || data.roll_no || "",
        class_id: data.class_id || null,
        section_id: data.section_id || null,
        lab_code: data.lab_code || null,
        status: "active",
        is_active: true,
        created_at: new Date().toISOString()
      };
      list.push(newStudent);
      localSet(`students-${schoolId}`, list);
      return newStudent;
    },
    update: (schoolId, studentId, updates) => {
      const list = localGet(`students-${schoolId}`, []);
      const idx = list.findIndex((s) => s.id === studentId);
      if (idx < 0) return null;
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      localSet(`students-${schoolId}`, list);
      return list[idx];
    },
    deactivate: (schoolId, studentId) => {
      const list = localGet(`students-${schoolId}`, []).map((s) =>
        s.id === studentId ? { ...s, status: "inactive", is_active: false, updated_at: new Date().toISOString() } : s
      );
      localSet(`students-${schoolId}`, list);
      return true;
    }
  }
};
