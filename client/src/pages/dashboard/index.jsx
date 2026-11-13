import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  BookMarked,
  Search,
  BookOpen,
  Scroll,
  GraduationCap,
  Compass,
  Video,
  Music,
  Play
} from "lucide-react";
import institutionHeroImg from "../../assets/image-aspera.jpg";
import { DynamicIcon } from "../../components/icons";
import { useLanguage } from "../../context/LanguageContext";
import { SHLOKA_VIDEOS } from "../../data/shlokaVideos";
import { SANSKRIT_SONGS } from "../../data/sanskritSongs";
import DummyMediaPlayerModal from "../../components/DummyMediaPlayerModal";

// Complete directory of all program sections available across SanskritLab
const allProgramSections = [
  // ─── RESEARCH & DIGITIZATION ───
  {
    category: "research",
    categoryLabel: "Research & Digitization",
    categoryLabelHi: "अनुसन्धानम् एवं डिजिटलीकरणम्",
    icon: "manuscript",
    title: "Manuscript Digitization (OCR)",
    desc: "Convert scanned Devanāgarī & Grantha manuscripts into searchable Unicode with native neural OCR.",
    link: "/research/ocr"
  },
  {
    category: "research",
    categoryLabel: "Research & Digitization",
    categoryLabelHi: "अनुसन्धानम् एवं डिजिटलीकरणम्",
    icon: "search",
    title: "Smart Corpus & Semantic Search",
    desc: "Explore indexed Sanskrit corpora with morphological matching, parallel translations, and citation lookup.",
    link: "/research/corpus"
  },
  {
    category: "research",
    categoryLabel: "Research & Digitization",
    categoryLabelHi: "अनुसन्धानम् एवं डिजिटलीकरणम्",
    icon: "feather",
    title: "Manuscript Annotation",
    desc: "Collaboratively annotate palm-leaf folios, tag readings, and maintain apparatus notes.",
    link: "/research/annotate"
  },
  {
    category: "research",
    categoryLabel: "Research & Digitization",
    categoryLabelHi: "अनुसन्धानम् एवं डिजिटलीकरणम्",
    icon: "temple",
    title: "NCERT Sanskrit Library",
    desc: "Complete Class 6–12 textbooks (Deepakam, Shemushi, Bhaswati, Shashwati) with digitized reader.",
    link: "/research/ncert"
  },
  {
    category: "research",
    categoryLabel: "Research & Digitization",
    categoryLabelHi: "अनुसन्धानम् एवं डिजिटलीकरणम्",
    icon: "feather",
    title: "NCERT Board Sample Papers",
    desc: "Class 10 & 12 board sample question papers with marking schemes, answer keys, and PDF view.",
    link: "/ncert/papers"
  },

  // ─── 3D VISUALIZATION & HISTORY ───
  {
    category: "visualization",
    categoryLabel: "3D & Visualization",
    categoryLabelHi: "त्रिआयामी दृश्यीकरणम्",
    icon: "palette",
    title: "3D Manuscript Viewer",
    desc: "Interactive 3D palm-leaf and birch-bark manuscript inspection with digitized transcription overlays.",
    link: "/visualization/3d"
  },
  {
    category: "visualization",
    categoryLabel: "3D & Visualization",
    categoryLabelHi: "त्रिआयामी दृश्यीकरणम्",
    icon: "grammar",
    title: "Grammar & Philosophy Maps",
    desc: "Pāṇini's Aṣṭādhyāyī rules as branching trees; Nyāya, Vedānta, and Mīmāṃsā networks visualized.",
    link: "/visualization/grammar"
  },
  {
    category: "visualization",
    categoryLabel: "3D & Visualization",
    categoryLabelHi: "त्रिआयामी दृश्यीकरणम्",
    icon: "chart",
    title: "Evolutionary Timeline",
    desc: "Interactive chronological journey mapping Vedic, Epic, Classical, and Modern Sanskrit evolution.",
    link: "/visualization/timeline"
  },

  // ─── TEACHING & ACADEMICS ───
  {
    category: "teaching",
    categoryLabel: "Teaching & Academics",
    categoryLabelHi: "शिक्षणम् एवं संस्था",
    icon: "teacher",
    title: "Institution HQ",
    desc: "Institutional dashboard for school administration, student roster management, and institutional analytics.",
    link: "/teaching/school"
  },
  {
    category: "teaching",
    categoryLabel: "Teaching & Academics",
    categoryLabelHi: "शिक्षणम् एवं संस्था",
    icon: "teacher",
    title: "Teacher Dashboard",
    desc: "Lesson builder, classroom assignments, student tracking, and manuscript annotation modules.",
    link: "/teaching/dashboard"
  },
  {
    category: "teaching",
    categoryLabel: "Teaching & Academics",
    categoryLabelHi: "शिक्षणम् एवं संस्था",
    icon: "student",
    title: "Student Workspace",
    desc: "Guided learning workbench with interactive texts, assigned drills, and collaborative tools.",
    link: "/teaching/workspace"
  },
  {
    category: "teaching",
    categoryLabel: "Teaching & Academics",
    categoryLabelHi: "शिक्षणम् एवं संस्था",
    icon: "feather",
    title: "Assessment Engine",
    desc: "Auto-generated diagnostic quizzes for noun declensions (vibhakti), verb conjugations, and sandhi.",
    link: "/teaching/assessment"
  },

  // ─── ADAPTIVE LEARNING ───
  {
    category: "learning",
    categoryLabel: "Adaptive Learning",
    categoryLabelHi: "अनुकूली शिक्षणम्",
    icon: "plant",
    title: "Learning Path (Skill Tree)",
    desc: "Structured curriculum from beginner to advanced with XP, streaks, quizzes, and unlocking milestones.",
    link: "/learning/tree"
  },
  {
    category: "learning",
    categoryLabel: "Adaptive Learning",
    categoryLabelHi: "अनुकूली शिक्षणम्",
    icon: "smile",
    title: "Child Learning Mode",
    desc: "Playful phonics, picture stories, games, and gentle interactive exercises designed for young learners.",
    link: "/learning/child"
  },
  {
    category: "learning",
    categoryLabel: "Adaptive Learning",
    categoryLabelHi: "अनुकूली शिक्षणम्",
    icon: "graduation-cap",
    title: "Doctoral & Scholar Workspace",
    desc: "Advanced critical apparatus, variant collation, manuscript study, and academic Sanskrit research.",
    link: "/learning/research"
  },
  {
    category: "learning",
    categoryLabel: "Adaptive Learning",
    categoryLabelHi: "अनुकूली शिक्षणम्",
    icon: "teacher",
    title: "Curriculum Builder",
    desc: "Design custom instructional syllabi, export PDF lesson plans, and structure graded benchmarks.",
    link: "/learning/curriculum"
  },

  // ─── AI TOOLS & LINGUISTIC SUITE ───
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "search",
    title: "Sanskrit Search",
    desc: "Search words, lessons, texts, and topics in Devanagari or English with live smart suggestions.",
    link: "/search"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "sparkles",
    title: "Explore Mode",
    desc: "Inspect any Sanskrit word to reveal morphological roots, vibhakti, pronunciation, and textual citations.",
    link: "/explore"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "book",
    title: "Monier-Williams Sanskrit Dictionary",
    desc: "Comprehensive Sanskrit-English lexicon with Devanagari, IAST, etymological roots, and examples.",
    link: "/dictionary"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "sun",
    title: "Daily Sanskrit",
    desc: "Word, phrase, and proverb of the day along with a 5-minute cultural immersion challenge.",
    link: "/daily"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "sparkles",
    title: "AI Sanskrit Tutor",
    desc: "Interactive Sanskrit & Hindi conversational tutor for grammar doubts, translation, and guided practice.",
    link: "/tools/tutor"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "mic",
    title: "Voice Mode",
    desc: "Speak naturally in Sanskrit or Hindi — receive instant auditory pronunciation analysis and spoken reply.",
    link: "/tools/voice"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "puzzle",
    title: "Sentence Builder",
    desc: "Interactive tile-based puzzle to construct grammatically sound Sanskrit sentences through play.",
    link: "/tools/sentence"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "health",
    title: "Fix My Sanskrit",
    desc: "Paste any composition for instant grammar validation: sandhi splitting, concord, and punctuation repair.",
    link: "/tools/fix"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "book",
    title: "Story Generator",
    desc: "Generate whimsical or historical Sanskrit stories with parallel translations and audio narration.",
    link: "/tools/story"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "globe",
    title: "Sanskrit → Real World",
    desc: "Explore how ancient Sanskrit concepts — karma, yoga, zero, guru, mantra — shape the modern world.",
    link: "/tools/realworld"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "calendar",
    title: "Culture Calendar",
    desc: "Track traditional panchang tithis, six seasons (ṛtus), and cultural festivals on a synchronized calendar.",
    link: "/tools/calendar"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "quote",
    title: "Who Said It?",
    desc: "Attribution quiz: match immortal Sanskrit shlokas and dialogues to their canonical authors.",
    link: "/tools/whosaid"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "plant",
    title: "Etymology Tree",
    desc: "Trace single verbal roots (dhātus) branching into hundreds of words across grammar and linguistics.",
    link: "/tools/etymology"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "search",
    title: "Concept Explorer",
    desc: "Plain-language deep-dives into core philosophical concepts, darśanas, and grammatical sutras.",
    link: "/tools/concepts"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "game",
    title: "Learn Through Games",
    desc: "Interactive word match, Devanagari number blitz, and Sandhi chase to keep language skills sharp.",
    link: "/tools/games"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "sword",
    title: "Vāda (Debate Mode)",
    desc: "Classical philosophical disputation mode: formulate Sanskrit arguments and counter-theses.",
    link: "/tools/debate"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "palette",
    title: "Creative Studio",
    desc: "Compose metered poetry: choose poetic meters (chandas), verify syllables, and hear the cadence.",
    link: "/tools/studio"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "cards",
    title: "SRS Flashcards",
    desc: "Scientifically optimized spaced-repetition flashcards for vocabulary, noun tables, and roots.",
    link: "/tools/flashcards"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "book",
    title: "Digital Bookshelf",
    desc: "Classical Sanskrit library spanning Rāmāyaṇa, Mahābhārata, Kālidāsa, Pañcatantra, and Hitopadeśa.",
    link: "/tools/bookshelf"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "alphabet",
    title: "Transliteration Engine",
    desc: "Live bidirectional conversion between Devanagari, IAST, Harvard-Kyoto, and ITRANS.",
    link: "/tools/transliterate"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "audio",
    title: "Sandhi Tool",
    desc: "Join and split Sanskrit words with exact rule-by-rule Pāṇinian explanations for Guṇa, Vṛddhi, Yaṇ, and Visarga.",
    link: "/tools/sandhi"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "plant",
    title: "Dhātu Explorer",
    desc: "Comprehensive catalogue of Sanskrit verb roots with gaṇa, pada, artha, and present tense conjugations.",
    link: "/tools/dhatu"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "shloka",
    title: "संस्कृत श्लोकाः (Shloka Explorer)",
    desc: "70+ canonical verses across 10 sacred scriptures (Gita, Upanishads, Ramayana, Hitopadesha, etc.) with word breakdown, Hindi/English meanings, and audio recitation.",
    link: "/tools/shloka"
  },
  {
    category: "tools",
    categoryLabel: "AI & Linguistic Tools",
    categoryLabelHi: "कृत्रिमबुद्धिः भाषासाधनानि च",
    icon: "trophy",
    title: "Sanskrit Jeopardy Hub",
    desc: "Exciting classroom Jeopardy game with board builder, test simulator, and category questions.",
    link: "/tools/jeopardy"
  },

  // ─── VIVA & EXAM PRACTICE ───
  {
    category: "viva",
    categoryLabel: "Viva & Exam Practice",
    categoryLabelHi: "मौखिकपरीक्षा एवं मूल्यांकनम्",
    icon: "mic",
    title: "AI Viva Simulator",
    desc: "Realistic oral viva practice with AI speech evaluation, question variations, and instant feedback.",
    link: "/viva/simulator"
  },
  {
    category: "viva",
    categoryLabel: "Viva & Exam Practice",
    categoryLabelHi: "मौखिकपरीक्षा एवं मूल्यांकनम्",
    icon: "alphabet",
    title: "Language Lab",
    desc: "Phonetic pronunciation laboratory for institutional labs and rigorous recitation training.",
    link: "/viva/lab"
  },
  {
    category: "viva",
    categoryLabel: "Viva & Exam Practice",
    categoryLabelHi: "मौखिकपरीक्षा एवं मूल्यांकनम्",
    icon: "analytics",
    title: "Performance Analytics Engine",
    desc: "Track proficiency metrics, identify pronunciation or grammar gaps, and receive tailored study plans.",
    link: "/viva/analytics"
  }
];

const programIconMap = {
  "/research/ocr": "/sanskritlab-icons/1_Research_and_Digitization/card-ocr.png",
  "/research/corpus": "/sanskritlab-icons/1_Research_and_Digitization/card-corpus.png",
  "/research/annotate": "/sanskritlab-icons/1_Research_and_Digitization/card-annotate.png",
  "/research/ncert": "/sanskritlab-icons/1_Research_and_Digitization/card-ncert-lib.png",
  "/ncert/papers": "/sanskritlab-icons/1_Research_and_Digitization/card-ncert-papers.png",

  "/visualization/3d": "/sanskritlab-icons/2_3D_and_Visualization/card-3d-viewer.png",
  "/visualization/grammar": "/sanskritlab-icons/2_3D_and_Visualization/card-grammar-maps.png",
  "/visualization/timeline": "/sanskritlab-icons/2_3D_and_Visualization/card-timeline.png",

  "/teaching/school": "/sanskritlab-icons/3_Teaching_and_Academics/card-school-hq.png",
  "/teaching/dashboard": "/sanskritlab-icons/3_Teaching_and_Academics/card-teacher-dash.png",
  "/teaching/workspace": "/sanskritlab-icons/3_Teaching_and_Academics/card-student-space.png",
  "/teaching/assessment": "/sanskritlab-icons/3_Teaching_and_Academics/card-assessment.png",

  "/learning/tree": "/sanskritlab-icons/4_Learning_and_Adaptive_Modules/card-skill-tree.png",
  "/learning/child": "/sanskritlab-icons/4_Learning_and_Adaptive_Modules/card-child-mode.png",
  "/learning/research": "/sanskritlab-icons/4_Learning_and_Adaptive_Modules/card-phd-space.png",
  "/learning/curriculum": "/sanskritlab-icons/4_Learning_and_Adaptive_Modules/card-curriculum.png",

  "/search": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-search.png",
  "/explore": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-explore.png",
  "/dictionary": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-dictionary.png",
  "/daily": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-daily.png",
  "/tools/tutor": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-ai-tutor.png",
  "/tools/voice": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-voice.png",
  "/tools/sentence": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-sentence.png",
  "/tools/fix": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-fix.png",
  "/tools/story": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-story.png",
  "/tools/realworld": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-realworld.png",
  "/tools/calendar": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-calendar.png",
  "/tools/whosaid": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-whosaid.png",
  "/tools/etymology": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-etymology.png",
  "/tools/concepts": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-concepts.png",
  "/tools/games": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-games.png",
  "/tools/debate": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-debate.png",
  "/tools/studio": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-studio.png",
  "/tools/flashcards": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-flashcards.png",
  "/tools/bookshelf": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-bookshelf.png",
  "/tools/transliterate": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-transliterate.png",
  "/tools/sandhi": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-sandhi.png",
  "/tools/dhatu": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-dhatu.png",
  "/tools/shloka": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-shloka.png",
  "/tools/jeopardy": "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-jeopardy.png",

  "/viva/simulator": "/sanskritlab-icons/6_Viva_and_Exam_Practice/card-viva-sim.png",
  "/viva/lab": "/sanskritlab-icons/6_Viva_and_Exam_Practice/card-viva-sim.png",
  "/viva/analytics": "/sanskritlab-icons/6_Viva_and_Exam_Practice/card-analytics.png",
};

const filterCategoryIcons = {
  research: "/sanskritlab-icons/1_Research_and_Digitization/card-corpus.png",
  visualization: "/sanskritlab-icons/2_3D_and_Visualization/card-3d-viewer.png",
  teaching: "/sanskritlab-icons/3_Teaching_and_Academics/card-school-hq.png",
  learning: "/sanskritlab-icons/4_Learning_and_Adaptive_Modules/card-skill-tree.png",
  tools: "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-ai-tutor.png",
  viva: "/sanskritlab-icons/6_Viva_and_Exam_Practice/card-viva-sim.png",
  shloka_videos: "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-shloka.png",
  sanskrit_songs: "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-voice.png",
};

const programFilterCategories = [
  { id: "all", label: "सर्वाणि साधनानि", labelHi: "सर्वाणि साधनानि" },
  { id: "research", label: "अनुसन्धानम्", labelHi: "अनुसन्धानम्" },
  { id: "visualization", label: "दृश्यीकरणम्", labelHi: "दृश्यीकरणम्" },
  { id: "teaching", label: "शिक्षणम्", labelHi: "शिक्षणम्" },
  { id: "learning", label: "शिक्षणमार्गाः", labelHi: "शिक्षणमार्गाः" },
  { id: "tools", label: "भाषासाधनानि", labelHi: "भाषासाधनानि" },
  { id: "viva", label: "मौखिकपरीक्षा", labelHi: "मौखिकपरीक्षा" },
  { id: "shloka_videos", label: "श्लोक-चलचित्राणि", labelHi: "श्लोक-चलचित्राणि" },
  { id: "sanskrit_songs", label: "संस्कृत-गीतानि", labelHi: "संस्कृत-गीतानि" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const hi = lang === "hi";

  const filterParam = searchParams.get("filter");
  const [activeFilter, setActiveFilter] = useState(
    filterParam && programFilterCategories.some((c) => c.id === filterParam)
      ? filterParam
      : "all"
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedSkeleton, setSelectedSkeleton] = useState(null);

  const handleNextSkeleton = () => {
    if (!selectedSkeleton) return;
    const list = selectedSkeleton.category === "shloka_videos" ? SHLOKA_VIDEOS : SANSKRIT_SONGS;
    const idx = list.findIndex((x) => x.id === selectedSkeleton.id);
    if (idx !== -1 && idx < list.length - 1) {
      setSelectedSkeleton(list[idx + 1]);
    }
  };

  const handlePrevSkeleton = () => {
    if (!selectedSkeleton) return;
    const list = selectedSkeleton.category === "shloka_videos" ? SHLOKA_VIDEOS : SANSKRIT_SONGS;
    const idx = list.findIndex((x) => x.id === selectedSkeleton.id);
    if (idx > 0) {
      setSelectedSkeleton(list[idx - 1]);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const selectCategory = (id) => {
    setActiveFilter(id);
    if (id !== "all") {
      setSearchParams({ filter: id });
    } else {
      setSearchParams({});
    }
    scrollToSection("programs");
  };

  useEffect(() => {
    const f = searchParams.get("filter");
    if (f && programFilterCategories.some((c) => c.id === f)) {
      setActiveFilter(f);
    } else {
      setActiveFilter("all");
    }
  }, [searchParams]);

  // Filter program sections based on category and search query
  const filteredPrograms = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();

    if (activeFilter === "shloka_videos") {
      if (!q) return SHLOKA_VIDEOS;
      return SHLOKA_VIDEOS.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.desc?.toLowerCase().includes(q) ||
          item.subTopic?.toLowerCase().includes(q) ||
          item.subTopicEn?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "sanskrit_songs") {
      if (!q) return SANSKRIT_SONGS;
      return SANSKRIT_SONGS.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.desc?.toLowerCase().includes(q) ||
          item.songName?.toLowerCase().includes(q) ||
          item.songNameEn?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q)
      );
    }

    return allProgramSections.filter((item) => {
      const matchCategory =
        activeFilter === "all" || item.category === activeFilter;
      if (!matchCategory) return false;

      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.desc?.toLowerCase().includes(q) ||
        item.categoryLabel?.toLowerCase().includes(q) ||
        item.categoryLabelHi?.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, searchFilter]);

  return (
    <>
      {/* ─── 1. HERO SECTION — INSTITUTIONAL ILLUSTRATION (FULL SCREEN WIDTH) ─── */}
      <section className="institutional-hero">
        <img
          src={institutionHeroImg}
          alt="SanskritLab Institutional Illustration"
          className="institutional-hero-bg"
          loading="eager"
        />
        <div className="institutional-hero-overlay">
          <div className="institutional-hero-content">
            <div className="institutional-badge">
              <Sparkles size={14} />
              <span>
                {hi
                  ? "संस्कृतम् — राष्ट्रिय अनुसन्धान एवं शिक्षण प्रतिष्ठानम्"
                  : "संस्कृतम् — SanskritLab · Academic & Research Sanctuary"}
              </span>
            </div>

            <h1>
              {hi ? "प्राचीन ज्ञानस्य " : "Bridging "}
              <span className="highlight">
                {hi ? "आधुनिक विज्ञानं च" : "Ancient Wisdom"}
              </span>
              <br />
              {hi ? "संयोजनम्" : "with Modern Technology"}
            </h1>

            <p className="hero-tagline">
              {hi
                ? "३डी दृश्यीकरणम्, कृत्रिमबुद्धि-साधनानि एवं सस्वर श्लोकपाठशाला — बालकेभ्यः अनुसन्धानछात्रेभ्यश्च।"
                : "A sanctuary for interactive 3D visualization, neural linguistics, and traditional shloka recitation — from playful beginnings to doctoral critical editions."}
            </p>

            <div className="institutional-hero-actions">
              <button
                className="btn btn-primary"
                onClick={() => selectCategory("shloka_videos")}
                style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#fff", border: "none" }}
              >
                <Video size={16} />
                <span>श्लोक-चलचित्राणि (50+ Shloka Videos)</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => selectCategory("sanskrit_songs")}
                style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", color: "#fff", border: "none" }}
              >
                <Music size={16} />
                <span>संस्कृत-गीतानि (50+ Sanskrit Songs)</span>
              </button>

              <button
                className="btn btn-outline"
                onClick={() => selectCategory("all")}
              >
                <Compass size={16} />
                <span>{hi ? "सर्वाणि साधनानि" : "Explore All Sections"}</span>
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate("/research/ncert")}
              >
                <BookMarked size={16} />
                <span>{hi ? "NCERT पाठ्यक्रमः" : "NCERT Curriculum"}</span>
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate("/learning/tree")}
              >
                <GraduationCap size={16} />
                <span>{hi ? "शिक्षण मार्गः" : "Learning Path"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ALL PROGRAM CONTENTS ORGANIZED & CENTRALIZED DIRECTLY BELOW HERO ─── */}
      <section className="programs-section" id="programs">
        <div className="section-header" style={{ textAlign: "center", maxWidth: 840, margin: "0 auto 32px" }}>
          <div className="shloka-header-badge" style={{ background: "rgba(63, 81, 181, 0.1)", color: "var(--vt-blue)", borderColor: "rgba(63, 81, 181, 0.25)" }}>
            <Compass size={14} />
            <span>{hi ? "संस्कृतम् सर्वाणि कार्यक्षेत्राणि" : "Complete Program Directory"}</span>
          </div>
          <h2>{hi ? "कार्यक्षेत्राणि एवं भाषासाधनानि" : "All Program Suites & Learning Tools"}</h2>
          <p style={{ margin: "0 auto" }}>
            {hi
              ? "अनुसन्धानम्, पाण्डुलिपि-डिजिटलीकरणम्, ३डी दृश्यीकरणम्, कक्षाशिक्षणम्, भाषासाधनानि एवं मौखिकपरीक्षा — सर्वं एकत्र सुसङ्गतम्।"
              : "Discover and launch every workspace, research tool, and interactive module in SanskritLab from one centralized directory."}
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="programs-filter-bar">
          <div className="programs-tabs">
            {programFilterCategories.map((tab) => {
              const active = activeFilter === tab.id;
              const tabIcon = filterCategoryIcons[tab.id];
              return (
                <button
                  key={tab.id}
                  className={`programs-tab-btn ${active ? "active" : ""}`}
                  onClick={() => selectCategory(tab.id)}
                >
                  {tabIcon && (
                    <img
                      src={tabIcon}
                      alt={tab.label}
                      className="tab-icon-img"
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="programs-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={hi ? "साधनं खोजें..." : "Search all tools & features..."}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button
                type="button"
                className="programs-search-clear"
                onClick={() => setSearchFilter("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Responsive Grid of Cards for Every Program Section */}
        {filteredPrograms.length === 0 ? (
          <div className="programs-empty-state">
            <BookOpen size={32} />
            <h4>{t("No program section matches your search")}</h4>
            <p>{t("Clear your filter to view all available suites.")}</p>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setActiveFilter("all");
                setSearchFilter("");
              }}
              style={{ marginTop: 8 }}
            >
              {t("View All Sections")}
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {filteredPrograms.map((p) => {
              const iconImg =
                programIconMap[p.link] ||
                (p.category === "shloka_videos"
                  ? "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-shloka.png"
                  : p.category === "sanskrit_songs"
                  ? "/sanskritlab-icons/5_AI_and_Linguistic_Tools/card-voice.png"
                  : null);

              const handleCardClick = () => {
                if (p.isSkeleton) {
                  setSelectedSkeleton(p);
                } else {
                  navigate(p.link);
                }
              };

              return (
                <div
                  key={p.id || p.link}
                  className={`vt-card${p.isSkeleton ? " video-card" : ""}`}
                  onClick={handleCardClick}
                >
                  {p.isSkeleton ? (
                    /* ─── VIDEO / SONG THUMBNAIL PREVIEW ─── */
                    <div
                      className="card-video-thumbnail"
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: 12,
                        background: p.bgGradient || "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 10,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                        boxSizing: "border-box"
                      }}
                    >
                      {/* Top Badges */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
                        <span
                          style={{
                            background: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(4px)",
                            color: "#fff",
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 4
                          }}
                        >
                          {p.category === "shloka_videos" ? "VIDEO · HD" : "AUDIO · SONG"}
                        </span>
                        <span
                          style={{
                            background: "rgba(0,0,0,0.8)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 4
                          }}
                        >
                          {p.duration}
                        </span>
                      </div>

                      {/* Center Glowing Play Button */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2
                        }}
                      >
                        <div
                          className="thumb-play-btn"
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            background: "rgba(255, 106, 0, 0.95)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            boxShadow: "0 4px 16px rgba(255,106,0,0.55)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <Play size={20} fill="#fff" style={{ marginLeft: 2 }} />
                        </div>
                      </div>

                      {/* Bottom Verse Line Snippet */}
                      <div
                        style={{
                          zIndex: 2,
                          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 100%)",
                          margin: "-10px -10px -10px -10px",
                          padding: "20px 10px 8px"
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: p.accentColor || "#fde68a",
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {p.verse || p.subTopic || p.songName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Regular tool icon */
                    <div className="card-icon">
                      {iconImg ? (
                        <img
                          src={iconImg}
                          alt={p.title}
                          className="card-icon-img"
                        />
                      ) : (
                        <DynamicIcon name={p.icon} size={28} />
                      )}
                    </div>
                  )}

                  <div className="card-text-group" style={p.isSkeleton ? { marginTop: 10, width: "100%", alignItems: "flex-start", textAlign: "left" } : {}}>
                    <h3 style={p.isSkeleton ? { textAlign: "left", fontSize: 15 } : {}}>{t(p.title)}</h3>
                    <p className="card-desc" style={p.isSkeleton ? { textAlign: "left", fontSize: 12 } : {}}>{t(p.desc)}</p>
                    {p.isSkeleton ? (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                        {p.meter && (
                          <span style={{ fontSize: 11, background: "rgba(255,140,0,0.12)", color: "var(--vt-orange-dark)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                            छन्दः {p.meter}
                          </span>
                        )}
                        {p.raga && (
                          <span style={{ fontSize: 11, background: "rgba(3,105,161,0.12)", color: "#0369a1", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                            रागः {p.raga}
                          </span>
                        )}
                        {p.composer && (
                          <span style={{ fontSize: 11, background: "rgba(109,40,217,0.12)", color: "#6d28d9", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                            {p.composer}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="card-category-sub">
                        {hi ? p.categoryLabelHi : p.categoryLabel}
                      </span>
                    )}
                  </div>

                  <span
                    className="card-link"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: p.isSkeleton ? "flex-start" : "center",
                      gap: 4,
                      width: "100%",
                      textAlign: p.isSkeleton ? "left" : "center",
                      marginTop: p.isSkeleton ? 8 : 14
                    }}
                  >
                    {p.isSkeleton
                      ? p.category === "shloka_videos"
                        ? "▶ चलचित्रं चालयतु (Play Video)"
                        : "▶ गीतं शृणोतु (Play Song)"
                      : t("Open Section")}{" "}
                    <ArrowRight size={14} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── NCERT CURRICULUM BANNER ─── */}
      <section className="section" style={{ paddingTop: 12, paddingBottom: 16 }}>
        <div
          className="ncert-hero-banner"
          onClick={() => navigate("/research/ncert")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 16,
            padding: "28px 32px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #10b981 0%, #0284c7 100%)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
            maxWidth: 1000,
            margin: "0 auto"
          }}
        >
          <BookMarked size={44} />
          <div>
            <h3 style={{ margin: 0, fontSize: 22, color: "#fff", textAlign: "center" }}>
              {t("NCERT Sanskrit Curriculum")}
            </h3>
            <p style={{ margin: "6px auto 0", opacity: 0.95, fontSize: 14, maxWidth: 600, textAlign: "center" }}>
              {t(
                "Class 6–12 textbooks (Deepakam, Shemushi, Bhaswati & Shashwati) with digitized reader and board sample papers."
              )}
            </p>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.2)",
              padding: "8px 20px",
              borderRadius: 50
            }}
          >
            {t("Browse Library")} <ArrowRight size={16} />
          </span>
        </div>
      </section>

      {/* ─── ACADEMIC STATS BAR ─── */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">3,000+</div>
          <div className="stat-label">{t("Years of Texts")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">12+</div>
          <div className="stat-label">{t("Curated Lessons")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">5</div>
          <div className="stat-label">{t("Adaptive Tracks")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">10,000+</div>
          <div className="stat-label">{t("Verses & Lexicon")}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">35+</div>
          <div className="stat-label">{t("Scholarly Tools")}</div>
        </div>
      </div>

      {/* ─── CALL TO ACTION BAR (PROMOTIONAL 100% FREE TEXT REMOVED) ─── */}
      <div className="cta-bar">
        <h2>{t("Ready to Begin Your Sanskrit Journey?")}</h2>
        <p>
          {t(
            "Join thousands of learners, teachers, and researchers discovering 3,000 years of Sanskrit wisdom through cutting-edge technology."
          )}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/learning/tree")}
        >
          {t("Start Learning Now")} <ArrowRight size={16} />
        </button>
      </div>

      {/* ─── INTERACTIVE DUMMY MEDIA PLAYER MODAL (WITH FULL CONTROLS & URL EMBED) ─── */}
      {selectedSkeleton && (
        <DummyMediaPlayerModal
          item={selectedSkeleton}
          onClose={() => setSelectedSkeleton(null)}
          onNext={handleNextSkeleton}
          onPrev={handlePrevSkeleton}
          hasNext={
            selectedSkeleton &&
            (selectedSkeleton.category === "shloka_videos" ? SHLOKA_VIDEOS : SANSKRIT_SONGS).findIndex(
              (x) => x.id === selectedSkeleton.id
            ) <
              (selectedSkeleton.category === "shloka_videos" ? SHLOKA_VIDEOS : SANSKRIT_SONGS).length - 1
          }
          hasPrev={
            selectedSkeleton &&
            (selectedSkeleton.category === "shloka_videos" ? SHLOKA_VIDEOS : SANSKRIT_SONGS).findIndex(
              (x) => x.id === selectedSkeleton.id
            ) > 0
          }
        />
      )}
    </>
  );
}

export default Dashboard;
