import { useState, useCallback, useRef } from "react";
import { devanagariLayouts, insertAtCursor } from "../services/keyboard";
import { useLanguage } from "../context/LanguageContext";
import { X, Copy, Check, Trash2 } from "lucide-react";

const tabs = [
  { key: "consonants", label: "व्यञ्जन" },
  { key: "vowels", label: "स्वर" },
  { key: "matras", label: "मात्रा" },
  { key: "digits", label: "अङ्क" },
  { key: "special", label: "चिह्न" }
];

function DevanagariKeyboard({ targetRef, onClose }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("consonants");
  const [caps, setCaps] = useState(false);
  const [halant, setHalant] = useState(false);
  const [copied, setCopied] = useState(false);
  const [internalText, setInternalText] = useState("");
  const keyboardRef = useRef(null);
  const internalInputRef = useRef(null);

  // Check if we have an external target element that is currently in the DOM
  const hasExternalTarget = Boolean(
    targetRef &&
    targetRef.current &&
    document.contains(targetRef.current) &&
    targetRef.current !== internalInputRef.current
  );

  const getActiveInput = useCallback(() => {
    if (hasExternalTarget) return targetRef.current;
    return internalInputRef.current;
  }, [hasExternalTarget, targetRef]);

  const type = useCallback((char) => {
    const input = getActiveInput();
    if (!input) return;
    insertAtCursor(input, char);
    if (!hasExternalTarget) {
      setInternalText(input.value);
    }
    if (halant) setHalant(false);
  }, [getActiveInput, hasExternalTarget, halant]);

  const typeHalant = useCallback(() => {
    const input = getActiveInput();
    if (!input) return;
    insertAtCursor(input, "्");
    if (!hasExternalTarget) {
      setInternalText(input.value);
    }
  }, [getActiveInput, hasExternalTarget]);

  const typeSpace = useCallback(() => {
    const input = getActiveInput();
    if (!input) return;
    insertAtCursor(input, " ");
    if (!hasExternalTarget) {
      setInternalText(input.value);
    }
  }, [getActiveInput, hasExternalTarget]);

  const typeBackspace = useCallback(() => {
    const input = getActiveInput();
    if (!input) return;
    insertAtCursor(input, "\b");
    if (!hasExternalTarget) {
      setInternalText(input.value);
    }
  }, [getActiveInput, hasExternalTarget]);

  const handleCopy = useCallback(() => {
    const input = getActiveInput();
    const textToCopy = input ? input.value : internalText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getActiveInput, internalText]);

  const handleClear = useCallback(() => {
    const input = getActiveInput();
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      try {
        input.focus();
      } catch (e) {}
    }
    setInternalText("");
  }, [getActiveInput]);

  const layout = devanagariLayouts[tab];

  return (
    <div className="devanagari-keyboard" ref={keyboardRef}>
      <div className="kb-header">
        <span className="kb-title">देवनागरी कुञ्जीपटल</span>
        <div className="kb-actions">
          <button
            type="button"
            className={`kb-toggle ${caps ? "active" : ""}`}
            onClick={() => setCaps((c) => !c)}
            onMouseDown={(e) => e.preventDefault()}
            title={t("Caps")}
          >
            अा
          </button>
          <button
            type="button"
            className="kb-close"
            onClick={onClose}
            aria-label={t("Close")}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* When no external input is targeted, show built-in preview/input bar */}
      {!hasExternalTarget && (
        <div className="kb-preview-bar">
          <input
            ref={internalInputRef}
            type="text"
            className="kb-preview-input"
            value={internalText}
            onChange={(e) => setInternalText(e.target.value)}
            placeholder="देवनागरी पाठः अत्र लिख्यताम्... (Type Devanagari here or click any page input)"
          />
          <button
            type="button"
            className="btn btn-sm btn-outline kb-action-btn"
            onClick={handleCopy}
            onMouseDown={(e) => e.preventDefault()}
            title={t("Copy")}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline kb-action-btn"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            title={t("Clear")}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="kb-tabs">
        {tabs.map((t2) => (
          <button
            key={t2.key}
            type="button"
            className={`kb-tab ${tab === t2.key ? "active" : ""}`}
            onClick={() => setTab(t2.key)}
            onMouseDown={(e) => e.preventDefault()}
          >
            {t2.label}
          </button>
        ))}
      </div>

      <div className="kb-body">
        {"groups" in layout
          ? layout.groups.map((group) => (
              <div key={group.name} className="kb-row">
                {group.chars.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    className="kb-key kons"
                    onClick={() => type(ch)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))
          : layout.chars.map((row, i) => (
              <div key={i} className="kb-row">
                {row.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    className="kb-key"
                    onClick={() => type(ch)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ))}

        <div className="kb-row kb-bottom-row">
          <button
            type="button"
            className="kb-key kb-key-halant"
            onClick={typeHalant}
            onMouseDown={(e) => e.preventDefault()}
          >
            ् (Halant)
          </button>
          <button
            type="button"
            className="kb-key kb-key-space"
            onClick={typeSpace}
            onMouseDown={(e) => e.preventDefault()}
          >
            ␣ Space
          </button>
          <button
            type="button"
            className="kb-key kb-key-bksp"
            onClick={typeBackspace}
            onMouseDown={(e) => e.preventDefault()}
            title="Backspace"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

export default DevanagariKeyboard;
