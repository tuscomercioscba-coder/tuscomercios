import { useCallback, useRef, useState } from "react";

export function useCanvasHistory(initialState = null) {
  const [state, setStateValue] = useState(initialState);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  const setState = useCallback((nextValue) => {
    setStateValue((current) => {
      const next =
        typeof nextValue === "function" ? nextValue(current) : nextValue;

      if (current != null) {
        pastRef.current.push(current);
        if (pastRef.current.length > 100) pastRef.current.shift();
      }

      futureRef.current = [];
      return next;
    });
  }, []);

  const reset = useCallback((next) => {
    pastRef.current = [];
    futureRef.current = [];
    setStateValue(next);
  }, []);

  const undo = useCallback(() => {
    setStateValue((current) => {
      const previous = pastRef.current.pop();
      if (!previous) return current;
      futureRef.current.push(current);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setStateValue((current) => {
      const next = futureRef.current.pop();
      if (!next) return current;
      pastRef.current.push(current);
      return next;
    });
  }, []);

  return {
    state,
    setState,
    reset,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
