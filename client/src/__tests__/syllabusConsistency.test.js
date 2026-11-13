import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { books, chapters } from "../data/books";
import { getChapterTextUrl } from "../data/ncertBooksTextIndex";
import { tryJoinSandhi } from "../services/sanskrit";
import { DHATUS } from "../data/dhatus";
import { anytimeTestQuestions } from "../data/jeopardyTest";
import { jeopardyCategories, doubleJeopardyCategories, finalJeopardy } from "../data/jeopardy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("Sanskrit Syllabus Consistency & Integrity", () => {
  it("books catalog has unique IDs, unique sortOrder values, and matching chapter counts", () => {
    const ids = new Set();
    const sortOrders = new Set();

    for (const book of books) {
      expect(ids.has(book.id), `Duplicate book id: ${book.id}`).toBe(false);
      ids.add(book.id);

      expect(sortOrders.has(book.sortOrder), `Duplicate sortOrder ${book.sortOrder} on ${book.id}`).toBe(false);
      sortOrders.add(book.sortOrder);

      if (chapters[book.id]) {
        expect(chapters[book.id].length, `Chapter count mismatch for ${book.id}`).toBe(book.totalChapters);
      }
    }
  });

  it("all digitized NCERT text chapter files exist on disk", () => {
    const digitizedIds = [
      "ncert-deepakam-6",
      "ncert-deepakam-7",
      "ncert-deepakam-8",
      "ncert-sharada-9",
      "ncert-vyakaranavithi"
    ];

    for (const bookId of digitizedIds) {
      const bookChapters = chapters[bookId];
      expect(bookChapters, `Missing chapters for ${bookId}`).toBeDefined();
      for (const ch of bookChapters) {
        const relUrl = getChapterTextUrl(bookId, ch.chapterNumber);
        expect(relUrl, `Missing text URL for ${bookId} ch.${ch.chapterNumber}`).toBeTruthy();
        const diskPath = path.join(ROOT_DIR, "client/public", relUrl.replace(/^\//, ""));
        expect(fs.existsSync(diskPath), `Missing digitized text file: ${diskPath}`).toBe(true);
      }
    }
  });

  it("Sandhi engine covers Svara (Dīrgha, Guṇa, Vṛddhi, Yaṇ, Ayādi, Pūrvarūpa), Visarga, and Vyañjana rules", () => {
    const cases = [
      ["राम", "अग्र", "रामाग्र"],
      ["अग्नि", "इव", "अग्नीव"],
      ["भानु", "उदयः", "भानूदयः"],
      ["देव", "इन्द्रः", "देवेन्द्रः"],
      ["सूर्य", "उदयः", "सूर्योदयः"],
      ["देव", "ऋषिः", "देवर्षिः"],
      ["सदा", "एव", "सदैव"],
      ["महा", "औषधम्", "महौषधम्"],
      ["इति", "आदि", "इत्यादि"],
      ["सु", "आगतम्", "स्वागतम्"],
      ["पितृ", "आदेशः", "पित्रादेशः"],
      ["ने", "अनम्", "नयनम्"],
      ["पौ", "अकः", "पावकः"],
      ["ते", "अपि", "तेऽपि"],
      ["नमः", "ते", "नमस्ते"],
      ["रामः", "च", "रामश्च"],
      ["रामः", "अस्ति", "रामोऽस्ति"],
      ["निः", "रसः", "नीरसः"],
      ["वाक्", "ईशः", "वागीशः"],
      ["सत्", "जनः", "सज्जनः"],
      ["सत्यम्", "वद", "सत्यं वद"]
    ];

    for (const [w1, w2, expected] of cases) {
      const res = tryJoinSandhi(w1, w2);
      expect(res.ok, `Expected sandhi match for ${w1} + ${w2}`).toBe(true);
      expect(res.result, `${w1} + ${w2}`).toBe(expected);
    }
  });

  it("DHATUS dataset contains valid gaṇa numbers (1–10) and non-empty conjugated forms", () => {
    expect(DHATUS.length).toBeGreaterThanOrEqual(40);
    for (const d of DHATUS) {
      expect(d.ganaNum).toBeGreaterThanOrEqual(1);
      expect(d.ganaNum).toBeLessThanOrEqual(10);
      expect(d.root.trim().length).toBeGreaterThan(0);
      expect(d.gana.trim().length).toBeGreaterThan(0);
      expect(d.present.trim().length).toBeGreaterThan(0);
    }
  });

  it("Jeopardy and Anytime Test datasets have valid option bounds and non-empty prompts", () => {
    for (const q of anytimeTestQuestions) {
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
    }

    for (const cat of [...jeopardyCategories, ...doubleJeopardyCategories]) {
      expect(cat.clues.length).toBeGreaterThan(0);
      for (const c of cat.clues) {
        expect(c.clue.trim().length).toBeGreaterThan(0);
        expect(c.answer.trim().length).toBeGreaterThan(0);
      }
    }
    expect(finalJeopardy.clue.trim().length).toBeGreaterThan(0);
    expect(finalJeopardy.answer.trim().length).toBeGreaterThan(0);
  });

  it("database SQL seeds and NCERT script are free of legacy curriculum errors and malformed ON CONFLICT clauses", () => {
    const sqlDir = path.join(ROOT_DIR, "database");
    const sqlFiles = fs.readdirSync(sqlDir).filter((f) => f.endsWith(".sql"));
    const forbidden = [
      "ncert-ruchira",
      "kalidasas-",
      "रत्वीजम्",
      "अनध्ययन",
      "Patanañjali",
      "आसीदुदन्तुमूलेषु",
      "कवित्वं निरसा",
      "पुत्रकामेश्टि",
      "karmaphalaseturbhūḥ"
    ];

    for (const file of sqlFiles) {
      const text = fs.readFileSync(path.join(sqlDir, file), "utf8");
      for (const bad of forbidden) {
        expect(text.includes(bad), `Found legacy error "${bad}" in database/${file}`).toBe(false);
      }
      expect(text, `Malformed ON CONFLICT placement in database/${file}`).not.toMatch(/ON CONFLICT \(id\) DO NOTHING;\s*["']/);
    }
  });

  it("sample papers are free of previously identified Sanskrit grammar typos", () => {
    const spDir = path.join(ROOT_DIR, "client/public/sample-papers");
    const files = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".html") || entry.name.endsWith(".md")) files.push(full);
      }
    };
    walk(spDir);
    const forbidden = ["तौ बालकाः", "अनुपयुक्ततन्त्रविशेषाः", "राजप्रसादात्", "हिमालायात्", "प्रकृत्ति-प्रत्ययाभ्यां"];

    expect(files.length).toBeGreaterThanOrEqual(30);
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const bad of forbidden) {
        expect(text.includes(bad), `Found typo "${bad}" in ${file}`).toBe(false);
      }
    }
  });
});
