import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { toDevanagari, tryJoinSandhi, trySplitSandhi, searchAll } from "../services/sanskrit";
import { checkSanskrit } from "../services/sanskritFixer";
import { getDefaultProgress, updateProgress } from "../services/learning";
import { RITUS, currentRitu, nextFestival } from "../data/cultureCalendar";
import { api } from "../services/api";
import { localGet, localSet, localRemove, userStore } from "../services/localStore";
import { layoutHi } from "../i18n/layout";
import { dashboardHi } from "../i18n/dashboard";
import { authHi } from "../i18n/auth";
import { learningHi } from "../i18n/learning";
import { researchHi } from "../i18n/research";
import { toolsHi } from "../i18n/tools";
import { miscHi } from "../i18n/misc";
import { translations } from "../i18n/translations";

describe("P0–P2 Regression Tests", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && typeof window.localStorage?.clear === "function") {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("toDevanagari converts multi-character IAST clusters accurately", () => {
    expect(toDevanagari("śānti")).toBe("शान्ति");
    expect(toDevanagari("jñāna")).toBe("ज्ञान");
    expect(toDevanagari("kṣetra")).toBe("क्षेत्र");
    expect(toDevanagari("bhārata")).toBe("भारत");
  });

  it("trySplitSandhi splits joined forms back using candidate pairs", () => {
    const splits = trySplitSandhi("अग्नीव", [
      ["अग्नि", "इव"],
      ["राम", "अग्र"],
      ["देव", "इन्द्र"]
    ]);
    expect(splits).toHaveLength(1);
    expect(splits[0].ok).toBe(true);
    expect(splits[0].result).toBe("अग्नि + इव");

    const joined = tryJoinSandhi("महा", "उत्सवः");
    expect(joined.ok).toBe(true);
    expect(joined.result).toBe("महोत्सवः");
  });

  it("searchAll returns local and Monier-Williams results for 'yoga'", async () => {
    const res = await searchAll("yoga");
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((r) => r.kind === "dictionary" && r.title === "योग")).toBe(true);
  }, 30000);

  it("checkSanskrit detects IAST input, missing danda, and unknown tokens", async () => {
    const r1 = await checkSanskrit("aham grham gacchami", async (w) => (w === "अहम्" ? "I" : null));
    expect(r1.iastInput).toBe(true);
    expect(r1.issues.some((i) => i.rule === "transliterate")).toBe(true);
    expect(r1.issues.some((i) => i.rule === "punctuation")).toBe(true);
    expect(r1.unknownWords.length).toBeGreaterThan(0);

    const r2 = await checkSanskrit("विद्या ददाति विनयम्।");
    expect(r2.iastInput).toBe(false);
    expect(r2.issues).toHaveLength(0);
  });

  it("learning.js updateProgress does not mutate input progress or shared skill presets", () => {
    const initial = getDefaultProgress();
    const skillRefBefore = initial.skills["skill-alphabet"];
    const updated = updateProgress(initial, "alphabet-vowels", 1, 2);

    expect(initial.completedLessons).toEqual([]);
    expect(initial.xp).toBe(0);
    expect(skillRefBefore.progress).toBe(0);
    expect(updated.completedLessons).toEqual(["alphabet-vowels"]);
    expect(updated.xp).toBeGreaterThan(0);
    expect(updated.skills["skill-alphabet"].progress).toBe(50);

    // A fresh default progress stays clean
    const freshAgain = getDefaultProgress();
    expect(freshAgain.skills["skill-alphabet"].progress).toBe(0);
  });

  it("cultureCalendar currentRitu maps all 12 months accurately and nextFestival returns valid upcoming event", () => {
    const expectedIdxByMonth = [5, 5, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
    for (let m = 0; m < 12; m++) {
      const ritu = currentRitu(new Date(2026, m, 15));
      expect(ritu).toBe(RITUS[expectedIdxByMonth[m]]);
    }
    const upcoming = nextFestival(new Date(2026, 0, 1));
    expect(upcoming.f).toBeDefined();
    expect(upcoming.days).toBeGreaterThanOrEqual(0);
  });

  it("api fetchJson throws on non-2xx responses and attaches JSON Content-Type header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal error"
    });
    await expect(api.grammar.parse("रामः")).rejects.toThrow("Internal error");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("localStore persists and retrieves values cleanly", () => {
    expect(localSet("test-key", { ok: true })).toBe(true);
    expect(localGet("test-key")).toEqual({ ok: true });
    localRemove("test-key");
    expect(localGet("test-key", "fallback")).toBe("fallback");

    userStore.save({ id: "u1", email: "Test@Example.com", role: "student" });
    expect(userStore.getByEmail("test@example.com")?.id).toBe("u1");
  });

  it("i18n modules have zero cross-file duplicate keys and preserve non-empty translations", () => {
    const groups = [layoutHi, dashboardHi, authHi, learningHi, researchHi, toolsHi, miscHi];
    const seen = new Set();
    for (const g of groups) {
      for (const [k, v] of Object.entries(g)) {
        expect(seen.has(k), `Cross-file duplicate i18n key: ${k}`).toBe(false);
        seen.add(k);
        expect(typeof v).toBe("string");
        expect(v.trim().length).toBeGreaterThan(0);
      }
    }
    expect(Object.keys(translations).length).toBe(seen.size);
  });
});

