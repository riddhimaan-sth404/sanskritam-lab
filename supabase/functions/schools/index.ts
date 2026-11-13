import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,apikey"
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

function err(detail: string, status = 400) {
  return json({ detail }, status);
}

function makeShortCode(name: string) {
  const letters = (name || "SCH").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3).padEnd(3, "S");
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${letters}${num}`;
}

async function getAuthUser(req: Request, url: string, anonKey: string) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function assertSchoolOwner(admin: ReturnType<typeof createClient>, schoolId: string, userId: string) {
  const { data: school, error } = await admin
    .from("schools")
    .select("id, owner_id")
    .eq("id", schoolId)
    .maybeSingle();
  if (error || !school) return { ok: false as const, status: 404, msg: "School not found" };
  if (school.owner_id !== userId) return { ok: false as const, status: 403, msg: "Forbidden" };
  return { ok: true as const, school };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!supabaseUrl || !serviceKey) return err("Supabase environment variables not configured", 500);

  const admin = createClient(supabaseUrl, serviceKey);
  const url = new URL(req.url);
  const subPath = "/" + url.pathname.replace(/^\/functions\/v1\/schools\/?|^\/schools\/?/, "").replace(/^\/+/, "");
  const method = req.method;

  try {
    // Public directory search
    if ((subPath === "/" || subPath === "") && method === "GET") {
      const q = url.searchParams.get("q")?.trim() || "";
      const ownerEmail = url.searchParams.get("owner_email")?.trim() || "";
      const size = Math.min(200, Math.max(1, Number(url.searchParams.get("size") || 50)));
      let query = admin.from("schools").select("*").eq("is_active", true).limit(size);
      if (ownerEmail) query = query.ilike("owner_email", ownerEmail);
      if (q) query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,short_code.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) return err(error.message, 500);
      return json({ data: data || [] });
    }

    // Student lab entry by school code + student lab_code
    if (subPath === "/join-lab" && method === "POST") {
      const body = await req.json();
      const sCode = String(body.school_code || "").trim();
      const lCode = String(body.lab_code || "").trim();
      if (!sCode || !lCode) return err("school_code and lab_code required", 400);
      const { data: school } = await admin.from("schools").select("id,name,short_code").ilike("short_code", sCode).maybeSingle();
      if (!school) return err("Invalid school or lab code", 404);
      const { data: student } = await admin
        .from("students")
        .select("id,name,lab_code,class_id,section_id")
        .eq("school_id", school.id)
        .eq("is_active", true)
        .ilike("lab_code", lCode)
        .maybeSingle();
      if (!student) return err("Invalid school or lab code", 404);
      return json({ data: { student_id: student.id, name: student.name, lab_code: student.lab_code, school_id: school.id, school_name: school.name } });
    }

    // Resolve teacher username or school short_code to login email
    if (subPath === "/resolve-login" && method === "POST") {
      const body = await req.json();
      const login = String(body.login || "").trim();
      if (!login) return err("login required", 400);
      const { data: teacher } = await admin
        .from("school_teachers")
        .select("email")
        .ilike("teacher_code", login)
        .eq("status", "active")
        .maybeSingle();
      if (teacher?.email) return json({ data: { email: teacher.email } });
      const { data: school } = await admin
        .from("schools")
        .select("owner_email,email")
        .or(`short_code.ilike.${login},name.ilike.${login}`)
        .maybeSingle();
      if (school?.owner_email || school?.email) {
        return json({ data: { email: school.owner_email || school.email } });
      }
      return err("Login not found", 404);
    }

    // Require authenticated user for mutations and full school details
    const user = await getAuthUser(req, supabaseUrl, anonKey);
    if (!user) return err("Unauthorized", 401);

    // POST / — create school
    if ((subPath === "/" || subPath === "") && method === "POST") {
      const body = await req.json();
      if (!body?.name?.trim()) return err("School name required", 400);
      const { data, error } = await admin
        .from("schools")
        .insert({
          name: body.name.trim(),
          city: body.city || "",
          state: body.state || "",
          school_type: body.school_type || "Senior Secondary School",
          board: body.board || "CBSE",
          short_code: makeShortCode(body.name),
          owner_id: user.id,
          owner_email: body.owner_email || user.email || null
        })
        .select("*")
        .single();
      if (error) return err(error.message, 400);
      return json({ data }, 201);
    }

    const parts = subPath.split("/").filter(Boolean);
    const schoolId = parts[0];
    if (!schoolId) return err("Not found", 404);

    // Teacher self-register with school
    if (parts.length === 2 && parts[1] === "teacher-register" && method === "POST") {
      const body = await req.json();
      const teacherCode = body.teacher_code || body.auth_username || null;
      const { data, error } = await admin
        .from("school_teachers")
        .insert({
          school_id: schoolId,
          name: body.name || user.email || "Teacher",
          email: body.email || user.email || null,
          teacher_code: teacherCode,
          phone: body.phone || null,
          designation: body.designation || "Sanskrit Teacher",
          subjects: Array.isArray(body.subjects) ? body.subjects : ["Sanskrit"],
          qualification: body.qualification || null,
          status: "active"
        })
        .select("*")
        .single();
      if (error) return err(error.message, 400);
      return json({ data }, 201);
    }

    // POST /:id — claim unclaimed school
    if (parts.length === 1 && method === "POST") {
      const { data: existing } = await admin.from("schools").select("id, owner_id").eq("id", schoolId).maybeSingle();
      if (!existing) return err("School not found", 404);
      if (existing.owner_id && existing.owner_id !== user.id) return err("School already claimed", 403);
      const { data, error } = await admin
        .from("schools")
        .update({ owner_id: user.id, owner_email: user.email || null })
        .eq("id", schoolId)
        .select("*")
        .single();
      if (error) return err(error.message, 400);
      return json({ data });
    }

    // All detailed views and modifications require school ownership
    const own = await assertSchoolOwner(admin, schoolId, user.id);
    if (!own.ok) return err(own.msg, own.status);

    // GET /:id — full detail (school + classes + sections + teachers + students)
    if (parts.length === 1 && method === "GET") {
      const { data: school, error } = await admin.from("schools").select("*").eq("id", schoolId).maybeSingle();
      if (error || !school) return err("School not found", 404);
      const [{ data: classes }, { data: teachers }, { data: students }] = await Promise.all([
        admin.from("school_classes").select("*, class_sections(*)").eq("school_id", schoolId).eq("is_active", true),
        admin.from("school_teachers").select("*").eq("school_id", schoolId).eq("status", "active"),
        admin.from("students").select("*").eq("school_id", schoolId).eq("is_active", true)
      ]);
      const formattedClasses = (classes || []).map((c: Record<string, unknown>) => ({
        ...c,
        sections: Array.isArray(c.class_sections)
          ? (c.class_sections as Record<string, unknown>[]).filter((s) => s.is_active !== false)
          : []
      }));
      return json({
        data: {
          ...school,
          classes: formattedClasses,
          teachers: teachers || [],
          students: students || []
        }
      });
    }

    if (parts.length === 1 && method === "PATCH") {
      const body = await req.json();
      const allowed: Record<string, unknown> = {};
      const fields = [
        "name", "udise_code", "cbse_affiliation_no", "cbse_exam_code",
        "school_type", "management", "board", "medium", "affiliation_status",
        "address", "city", "district", "state", "pincode", "phone", "email",
        "website", "principal_name"
      ];
      for (const f of fields) {
        if (body[f] !== undefined) allowed[f] = body[f];
      }
      const { data, error } = await admin.from("schools").update(allowed).eq("id", schoolId).select("*").single();
      if (error) return err(error.message, 400);
      return json({ data });
    }

    if (parts.length === 1 && method === "DELETE") {
      const { error } = await admin.from("schools").update({ is_active: false }).eq("id", schoolId);
      if (error) return err(error.message, 400);
      return json({ ok: true });
    }

    // Classes & Sections
    if (parts[1] === "classes") {
      if (parts.length === 2 && method === "GET") {
        const { data, error } = await admin.from("school_classes").select("*, class_sections(*)").eq("school_id", schoolId).eq("is_active", true);
        if (error) return err(error.message, 400);
        return json({ data: data || [] });
      }
      if (parts.length === 2 && method === "POST") {
        const body = await req.json();
        const { data, error } = await admin.from("school_classes").insert({ school_id: schoolId, name: body.name }).select("*").single();
        if (error) return err(error.message, 400);
        return json({ data }, 201);
      }
      const classId = parts[2];
      if (parts.length === 3 && method === "DELETE") {
        const { error } = await admin.from("school_classes").update({ is_active: false }).eq("id", classId).eq("school_id", schoolId);
        if (error) return err(error.message, 400);
        return json({ ok: true });
      }
      if (parts[3] === "sections" && parts.length === 4 && method === "POST") {
        const body = await req.json();
        const { data, error } = await admin.from("class_sections").insert({ class_id: classId, name: body.name }).select("*").single();
        if (error) return err(error.message, 400);
        return json({ data }, 201);
      }
      if (parts[3] === "sections" && parts.length === 5 && method === "DELETE") {
        const { error } = await admin.from("class_sections").update({ is_active: false }).eq("id", parts[4]).eq("class_id", classId);
        if (error) return err(error.message, 400);
        return json({ ok: true });
      }
    }

    // Students
    if (parts[1] === "students") {
      if (parts.length === 2 && method === "GET") {
        const { data, error } = await admin.from("students").select("*").eq("school_id", schoolId).eq("is_active", true);
        if (error) return err(error.message, 400);
        return json({ data: data || [] });
      }
      if (parts.length === 2 && method === "POST") {
        const body = await req.json();
        const { data, error } = await admin.from("students").insert({ ...body, school_id: schoolId }).select("*").single();
        if (error) return err(error.message, 400);
        return json({ data }, 201);
      }
      if (parts.length === 3 && method === "PATCH") {
        const body = await req.json();
        const { data, error } = await admin.from("students").update(body).eq("id", parts[2]).eq("school_id", schoolId).select("*").single();
        if (error) return err(error.message, 400);
        return json({ data });
      }
      if (parts.length === 3 && method === "DELETE") {
        const { error } = await admin.from("students").update({ is_active: false, status: "inactive" }).eq("id", parts[2]).eq("school_id", schoolId);
        if (error) return err(error.message, 400);
        return json({ ok: true });
      }
    }

    // Teachers
    if (parts[1] === "teachers") {
      if (parts.length === 2 && method === "GET") {
        const { data, error } = await admin.from("school_teachers").select("*").eq("school_id", schoolId).eq("status", "active");
        if (error) return err(error.message, 400);
        return json({ data: data || [] });
      }
      if (parts.length === 2 && method === "POST") {
        const body = await req.json();
        const { data, error } = await admin.from("school_teachers").insert({
          school_id: schoolId,
          name: body.name || "Teacher",
          email: body.email || null,
          phone: body.phone || null,
          teacher_code: body.teacher_code || body.auth_username || null,
          designation: body.designation || "Sanskrit Teacher",
          subjects: Array.isArray(body.subjects) ? body.subjects : ["Sanskrit"],
          qualification: body.qualification || null,
          status: body.status || "active"
        }).select("*").single();
        if (error) return err(error.message, 400);
        return json({ data }, 201);
      }
      if (parts.length === 3 && method === "DELETE") {
        const { error } = await admin.from("school_teachers").update({ status: "inactive" }).eq("id", parts[2]).eq("school_id", schoolId);
        if (error) return err(error.message, 400);
        return json({ ok: true });
      }
    }

    // Settings
    if (parts[1] === "settings" && parts.length === 2) {
      if (method === "GET") {
        const { data, error } = await admin.from("school_settings").select("*").eq("school_id", schoolId).maybeSingle();
        if (error) return err(error.message, 400);
        return json({ data: data || { school_id: schoolId, features: {}, branding: {}, curriculum: {} } });
      }
      if (method === "PUT") {
        const body = await req.json();
        const { data, error } = await admin
          .from("school_settings")
          .upsert({ school_id: schoolId, ...body, updated_by: user.id }, { onConflict: "school_id" })
          .select("*")
          .single();
        if (error) return err(error.message, 400);
        return json({ data });
      }
    }

    return err("Not found", 404);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});

