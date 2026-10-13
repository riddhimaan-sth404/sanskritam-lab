import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import DevanagariKeyboard from "../components/DevanagariKeyboard";

const KeyboardContext = createContext(null);

function KeyboardProvider({ children }) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null);
  const activeInputRef = useRef(null);

  // Globally track any focused input or textarea across the entire app
  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !target.closest(".devanagari-keyboard")
      ) {
        activeInputRef.current = target;
        // If keyboard is open, automatically switch target to this newly focused input
        setCurrentTarget({ current: target });
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  const openKeyboard = useCallback((ref) => {
    if (ref && ref.current) {
      setCurrentTarget(ref);
    } else if (activeInputRef.current && document.contains(activeInputRef.current)) {
      setCurrentTarget({ current: activeInputRef.current });
    } else {
      setCurrentTarget(null);
    }
    setKeyboardVisible(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setKeyboardVisible(false);
  }, []);

  const toggleKeyboard = useCallback((ref) => {
    setKeyboardVisible((prev) => {
      if (prev) {
        return false;
      }
      if (ref && ref.current) {
        setCurrentTarget(ref);
      } else if (activeInputRef.current && document.contains(activeInputRef.current)) {
        setCurrentTarget({ current: activeInputRef.current });
      } else {
        setCurrentTarget(null);
      }
      return true;
    });
  }, []);

  const registerInput = useCallback((ref) => {
    if (ref?.current) {
      activeInputRef.current = ref.current;
    }
  }, []);

  return (
    <KeyboardContext.Provider
      value={{
        keyboardVisible,
        openKeyboard,
        closeKeyboard,
        toggleKeyboard,
        registerInput,
        currentTarget
      }}
    >
      {children}
      {keyboardVisible && (
        <div className="kb-overlay">
          <DevanagariKeyboard targetRef={currentTarget} onClose={closeKeyboard} />
        </div>
      )}
    </KeyboardContext.Provider>
  );
}
function useKeyboard() {
  const ctx = useContext(KeyboardContext);
  if (!ctx) throw new Error("useKeyboard must be used within KeyboardProvider");
  return ctx;
}
export {
  KeyboardProvider,
  useKeyboard
};
