import { useEffect, useState } from 'react';

function readStoredState(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function usePersistentState(key, fallbackValue) {
  const [value, setValue] = useState(() => readStoredState(key, fallbackValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export { usePersistentState };
