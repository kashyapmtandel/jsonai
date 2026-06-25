import { useState, useCallback } from 'react';

export const useJsonParser = () => {
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(null);

  const parseJson = useCallback((text) => {
    if (!text || !text.trim()) {
      setError(null);
      setIsValid(null);
      return null;
    }
    try {
      const parsed = JSON.parse(text);
      setError(null);
      setIsValid(true);
      return parsed;
    } catch (e) {
      const match = e.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : null;
      let line = null;
      let column = null;
      if (position !== null) {
        const lines = text.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      setError({
        message: e.message,
        position,
        line,
        column,
      });
      setIsValid(false);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsValid(null);
  }, []);

  return { parseJson, error, isValid, clearError };
};
