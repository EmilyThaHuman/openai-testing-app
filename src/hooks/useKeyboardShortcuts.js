import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      try {
        const { key, ctrlKey, shiftKey, altKey } = event;

        for (const shortcut of shortcuts) {
          const { keys, callback, preventDefault = true } = shortcut;

          const matchesKey = keys.key === key;
          const matchesCtrl = keys.ctrlKey === ctrlKey;
          const matchesShift = keys.shiftKey === shiftKey;
          const matchesAlt = keys.altKey === altKey;

          if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
            if (preventDefault) {
              event.preventDefault();
            }
            callback(event);
            break;
          }
        }
      } catch (error) {
        console.error(error, { context: "useKeyboardShortcuts" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
