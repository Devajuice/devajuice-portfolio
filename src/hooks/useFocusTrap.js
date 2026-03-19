import { useEffect } from "react";

/**
 * Traps keyboard focus inside `ref` while `active` is true.
 * Extracted from EasterEgg.jsx and KeyboardShortcuts.jsx to avoid duplication (Fix #11).
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const panel = ref.current;
    const focusable = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [active, ref]);
}
