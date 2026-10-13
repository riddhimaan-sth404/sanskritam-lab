const devanagariLayouts = {
  vowels: {
    label: "\u0938\u094D\u0935\u0930",
    chars: [
      ["\u0905", "\u0906", "\u0907", "\u0908", "\u0909", "\u090A"],
      ["\u090B", "\u0960", "\u090C", "\u090F", "\u0910", "\u0913"],
      ["\u0914", "\u0905\u0902", "\u0905\u0903", "\u0910", "\u0914"]
    ]
  },
  consonants: {
    label: "\u0935\u094D\u092F\u091E\u094D\u091C\u0928",
    groups: [
      { name: "\u0915\u0923\u094D\u0920\u094D\u092F (Guttural)", chars: ["\u0915", "\u0916", "\u0917", "\u0918", "\u0919"] },
      { name: "\u0924\u093E\u0932\u0935\u094D\u092F (Palatal)", chars: ["\u091A", "\u091B", "\u091C", "\u091D", "\u091E"] },
      { name: "\u092E\u0942\u0930\u094D\u0927\u0928\u094D\u092F (Retroflex)", chars: ["\u091F", "\u0920", "\u0921", "\u0922", "\u0923"] },
      { name: "\u0926\u0928\u094D\u0924\u094D\u092F (Dental)", chars: ["\u0924", "\u0925", "\u0926", "\u0927", "\u0928"] },
      { name: "\u0913\u0937\u094D\u0920\u094D\u092F (Labial)", chars: ["\u092A", "\u092B", "\u092C", "\u092D", "\u092E"] },
      { name: "\u0905\u0928\u094D\u0924\u0903\u0938\u094D\u0925 (Semivowels)", chars: ["\u092F", "\u0930", "\u0932", "\u0935"] },
      { name: "\u090A\u0937\u094D\u092E\u0928\u094D (Sibilants)", chars: ["\u0936", "\u0937", "\u0938", "\u0939"] }
    ]
  },
  matras: {
    label: "\u092E\u093E\u0924\u094D\u0930\u093E",
    chars: [
      ["\u093E", "\u093F", "\u0940", "\u0941", "\u0942", "\u0943"],
      ["\u0947", "\u0948", "\u094B", "\u094C", "\u0902", "\u0903"],
      ["\u0901", "\u094D"]
    ]
  },
  digits: {
    label: "\u0905\u0919\u094D\u0915",
    chars: [
      ["\u0966", "\u0967", "\u0968", "\u0969", "\u096A"],
      ["\u096B", "\u096C", "\u096D", "\u096E", "\u096F"]
    ]
  },
  special: {
    label: "\u091A\u093F\u0939\u094D\u0928",
    chars: [
      ["\u0950", "\u0964", "\u0965", "\u0970"],
      ["\u093D", "\u0931", "\u0934", "\u095C", "\u095D"]
    ]
  }
};
function insertAtCursor(input, char) {
  if (!input) return;
  const val = input.value || "";
  const start = typeof input.selectionStart === "number" ? input.selectionStart : val.length;
  const end = typeof input.selectionEnd === "number" ? input.selectionEnd : start;

  let newVal = "";
  let newCursor = start;

  if (char === "\b" || char === "backspace") {
    if (start === end && start > 0) {
      newVal = val.slice(0, start - 1) + val.slice(start);
      newCursor = start - 1;
    } else if (start !== end) {
      newVal = val.slice(0, start) + val.slice(end);
      newCursor = start;
    } else {
      return;
    }
  } else {
    newVal = val.slice(0, start) + char + val.slice(end);
    newCursor = start + char.length;
  }

  // Use native prototype setter so React tracks value change and fires onChange
  const proto = (input instanceof HTMLTextAreaElement || input.tagName === "TEXTAREA")
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  if (descriptor && descriptor.set) {
    descriptor.set.call(input, newVal);
  } else {
    input.value = newVal;
  }

  if (typeof input.setSelectionRange === "function") {
    try {
      input.setSelectionRange(newCursor, newCursor);
    } catch (e) {}
  }

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  try {
    input.focus();
  } catch (e) {}
}
export {
  devanagariLayouts,
  insertAtCursor
};
