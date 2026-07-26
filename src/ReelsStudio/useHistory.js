import { useCallback, useRef, useState } from "react";

export default function useHistory(initialValue) {
  const [value, setValueState] = useState(initialValue);
  const past = useRef([]);
  const future = useRef([]);

  const setValue = useCallback((next) => {
    setValueState((current) => {
      const resolved =
        typeof next === "function" ? next(current) : next;

      past.current.push(current);
      if (past.current.length > 100) past.current.shift();

      future.current = [];
      return resolved;
    });
  }, []);

  const reset = useCallback((next) => {
    past.current = [];
    future.current = [];
    setValueState(next);
  }, []);

  const undo = useCallback(() => {
    setValueState((current) => {
      const previous = past.current.pop();
      if (!previous) return current;

      future.current.push(current);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setValueState((current) => {
      const next = future.current.pop();
      if (!next) return current;

      past.current.push(current);
      return next;
    });
  }, []);

  return {
    value,
    setValue,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
