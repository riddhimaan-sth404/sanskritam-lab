import { useState } from "react";
import {
  Flame,
  Droplets,
  Sun,
  Moon,
  Sparkles,
  Fish,
  Languages,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Check
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
const letters = [
  // 13 Vowels (Svara) + Anusvara & Visarga
  { dev: "\u0905", trans: "a", sound: "u", example: "up (short a)" },
  { dev: "\u0906", trans: "\u0101", sound: "a", example: "father (long \u0101)" },
  { dev: "\u0907", trans: "i", sound: "i", example: "sit (short i)" },
  { dev: "\u0908", trans: "\u012B", sound: "ee", example: "see (long \u012B)" },
  { dev: "\u0909", trans: "u", sound: "u", example: "put (short u)" },
  { dev: "\u090A", trans: "\u016B", sound: "oo", example: "moon (long \u016B)" },
  { dev: "\u090B", trans: "\u1E5B", sound: "\u1E5B", example: "krishna / crisp r (vocalic \u1E5B)" },
  { dev: "\u0960", trans: "\u1E5D", sound: "\u1E5D", example: "long vocalic \u1E5D" },
  { dev: "\u090C", trans: "\u1E37", sound: "\u1E37", example: "syllabic l (kl\u1E5Bpta)" },
  { dev: "\u090F", trans: "e", sound: "ey", example: "they (long e)" },
  { dev: "\u0910", trans: "ai", sound: "ai", example: "aisle (diphthong ai)" },
  { dev: "\u0913", trans: "o", sound: "o", example: "go (long o)" },
  { dev: "\u0914", trans: "au", sound: "ou", example: "out (diphthong au)" },
  { dev: "\u0905\u0902", trans: "a\u1E43", sound: "m", example: "hum (anusv\u0101ra)" },
  { dev: "\u0905\u0903", trans: "a\u1E25", sound: "\u1E25", example: "soft final breath ha (visarga)" },
  // Velar / Guttural (Ka-varga)
  { dev: "\u0915", trans: "ka", sound: "k", example: "skip (unaspirated k)" },
  { dev: "\u0916", trans: "kha", sound: "kh", example: "blockhead (aspirated kh)" },
  { dev: "\u0917", trans: "ga", sound: "g", example: "go (unaspirated g)" },
  { dev: "\u0918", trans: "gha", sound: "gh", example: "ghost / dig hard (aspirated gh)" },
  { dev: "\u0919", trans: "\u1E45a", sound: "ng", example: "sing (velar nasal \u1E45)" },
  // Palatal (Ca-varga)
  { dev: "\u091A", trans: "ca", sound: "ch", example: "chop (unaspirated ch)" },
  { dev: "\u091B", trans: "cha", sound: "chh", example: "catch him (aspirated chh)" },
  { dev: "\u091C", trans: "ja", sound: "j", example: "jar (unaspirated j)" },
  { dev: "\u091D", trans: "jha", sound: "jh", example: "hedgehog (aspirated jh)" },
  { dev: "\u091E", trans: "\xF1a", sound: "ny", example: "canyon (palatal nasal \xF1)" },
  // Retroflex / Cerebral (\u1E6Ca-varga)
  { dev: "\u091F", trans: "\u1E6Da", sound: "\u1E6D", example: "stop with curled tongue (retroflex \u1E6D)" },
  { dev: "\u0920", trans: "\u1E6Dha", sound: "\u1E6Dh", example: "anthill with curled tongue (retroflex \u1E6Dh)" },
  { dev: "\u0921", trans: "\u1E0Da", sound: "\u1E0D", example: "drum with curled tongue (retroflex \u1E0D)" },
  { dev: "\u0922", trans: "\u1E0Dha", sound: "\u1E0Dh", example: "redhead with curled tongue (retroflex \u1E0Dh)" },
  { dev: "\u0923", trans: "\u1E47a", sound: "\u1E47", example: "under with curled tongue (retroflex \u1E47)" },
  // Dental (Ta-varga)
  { dev: "\u0924", trans: "ta", sound: "t", example: "soft t against teeth (dental t)" },
  { dev: "\u0925", trans: "tha", sound: "th", example: "at home — soft th on teeth (dental th)" },
  { dev: "\u0926", trans: "da", sound: "d", example: "day with tongue on teeth (dental d)" },
  { dev: "\u0927", trans: "dha", sound: "dh", example: "adhere with tongue on teeth (dental dh)" },
  { dev: "\u0928", trans: "na", sound: "n", example: "name (dental n)" },
  // Labial (Pa-varga)
  { dev: "\u092A", trans: "pa", sound: "p", example: "spin (unaspirated p)" },
  { dev: "\u092B", trans: "pha", sound: "ph", example: "uphill (aspirated ph)" },
  { dev: "\u092C", trans: "ba", sound: "b", example: "boy (unaspirated b)" },
  { dev: "\u092D", trans: "bha", sound: "bh", example: "abhor (aspirated bh)" },
  { dev: "\u092E", trans: "ma", sound: "m", example: "mother (labial m)" },
  // Semivowels (Antahstha) & Sibilants / Aspirate (\u016A\u1E63ma)
  { dev: "\u092F", trans: "ya", sound: "y", example: "yes (palatal semivowel y)" },
  { dev: "\u0930", trans: "ra", sound: "r", example: "run (tapped retroflex r)" },
  { dev: "\u0932", trans: "la", sound: "l", example: "love (dental l)" },
  { dev: "\u0935", trans: "va", sound: "v", example: "vine / water (labiodental v)" },
  { dev: "\u0936", trans: "\u015Ba", sound: "sh", example: "ship (palatal \u015B)" },
  { dev: "\u0937", trans: "\u1E63a", sound: "\u1E63", example: "sh with curled tongue (retroflex \u1E63)" },
  { dev: "\u0938", trans: "sa", sound: "s", example: "sun (dental s)" },
  { dev: "\u0939", trans: "ha", sound: "h", example: "house (voiced aspirate h)" }
];
const pictureWords = [
  { word: "\u0905\u0917\u094D\u0928\u093F", meaning: "fire", icon: "flame", color: "#ff5722" },
  { word: "\u091C\u0932", meaning: "water", icon: "water", color: "#03a9f4" },
  { word: "\u0938\u0942\u0930\u094D\u092F", meaning: "sun", icon: "sun", color: "#ff9800" },
  { word: "\u091A\u0928\u094D\u0926\u094D\u0930", meaning: "moon", icon: "moon", color: "#9c27b0" },
  { word: "\u092A\u0941\u0937\u094D\u092A", meaning: "flower", icon: "flower", color: "#e91e63" },
  { word: "\u092E\u0924\u094D\u0938\u094D\u092F", meaning: "fish", icon: "fish", color: "#00bcd4" }
];
function renderWordIcon(icon, size = 64, color = "var(--vt-orange)") {
  switch (icon) {
    case "flame":
      return <Flame size={size} color={color} />;
    case "water":
      return <Droplets size={size} color={color} />;
    case "sun":
      return <Sun size={size} color={color} />;
    case "moon":
      return <Moon size={size} color={color} />;
    case "flower":
      return <Sparkles size={size} color={color} />;
    case "fish":
      return <Fish size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
}
function ChildModePage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("letters");
  const [currentLetter, setCurrentLetter] = useState(0);
  const [currentPic, setCurrentPic] = useState(0);
  const [matched, setMatched] = useState([]);
  const [guess, setGuess] = useState("");
  const cl = letters[currentLetter];
  const cp = pictureWords[currentPic];
  const checkColorGuess = () => {
    const correct = pictureWords.findIndex((pw, i) => i === currentPic && guess.trim() === pw.word);
    if (correct >= 0 && !matched.includes(correct)) {
      setMatched([...matched, correct]);
      setGuess("");
      if (currentPic < pictureWords.length - 1) setCurrentPic((p) => p + 1);
    }
  };
  return <div className="page-container">
      <div className="page-header">
        <h2>{t("Fun Learning \u2014 Play Mode")}</h2>
        <p>{t("Learn Sanskrit through pictures, colors, and play. Perfect for young learners!")}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <button className={`btn ${tab === "letters" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("letters")}>
          <Languages size={16} /> <span>{t("Alphabet Cards")}</span>
        </button>
        <button className={`btn ${tab === "words" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("words")}>
          <ImageIcon size={16} /> <span>{t("Picture Words")}</span>
        </button>
      </div>

      {tab === "letters" && <div className="card" style={{ textAlign: "center" }}>
          <div style={{
    fontSize: 96,
    fontFamily: "'Noto Sans Devanagari', serif",
    color: "#f0f0f0",
    lineHeight: 1.2,
    padding: 40,
    background: "linear-gradient(135deg, #1a1a3e, #2a1a3e)",
    borderRadius: 16,
    marginBottom: 20,
    border: "2px solid var(--sanskrit-gold)"
  }}>
            {cl.dev}
          </div>
          <div style={{ fontSize: 18, marginBottom: 4, color: "var(--vt-text)" }}>
            {t("Say: ")}<strong>{cl.trans}</strong>
          </div>
          <div style={{ fontSize: 14, color: "var(--vt-text-light)", marginBottom: 20 }}>
            {t("Like the ")}<strong>{cl.sound}</strong>{t(" in ")}"{cl.example}"
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={() => setCurrentLetter((p) => (p - 1 + letters.length) % letters.length)}>
              <ArrowLeft size={16} /> <span>{t("Previous")}</span>
            </button>
            <button className="btn btn-primary" onClick={() => setCurrentLetter((p) => (p + 1) % letters.length)}>
              <span>{t("Next")}</span> <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "var(--vt-text-lighter)", display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
            {letters.map((_, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === currentLetter ? "var(--sanskrit-gold)" : "var(--vt-border)", display: "inline-block" }} />)}
          </div>
        </div>}

      {tab === "words" && <div className="card" style={{ textAlign: "center" }}>
          <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    background: "linear-gradient(135deg, #1a2a1e, #2a1a1e)",
    borderRadius: 16,
    marginBottom: 16,
    border: "2px solid var(--sanskrit-gold)"
  }}>
            {renderWordIcon(cp.icon, 72, cp.color)}
          </div>
          <div style={{ fontSize: 14, color: "var(--vt-text-light)", marginBottom: 4 }}>{t("What is this in Sanskrit?")}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
            <input
    value={guess}
    onChange={(e) => setGuess(e.target.value)}
    placeholder={t("Type the Sanskrit word...")}
    style={{ maxWidth: 280 }}
    onKeyDown={(e) => e.key === "Enter" && checkColorGuess()}
  />
            <button className="btn btn-primary" onClick={checkColorGuess}>
              <Check size={16} /> <span>{t("Check")}</span>
            </button>
          </div>
          <div style={{ fontSize: 18, fontFamily: "'Noto Sans Devanagari', serif", color: "var(--sanskrit-gold)" }}>
            {cp.word} — {cp.meaning}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {pictureWords.map((pw, i) => <span key={i} style={{
    padding: 10,
    borderRadius: 8,
    background: matched.includes(i) ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.03)",
    border: matched.includes(i) ? "2px solid #4caf50" : "2px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
                {renderWordIcon(pw.icon, 24, pw.color)}
              </span>)}
          </div>
        </div>}
    </div>;
}
export {
  ChildModePage as default
};
