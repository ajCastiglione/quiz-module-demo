import { useRef, useCallback } from "react";

/**
 * A custom hook that returns a debounced version of the provided callback function.
 * The debounced function will delay the execution of the callback until after
 * the specified delay period has passed since the last time it was invoked.
 *
 * @param cb - The callback function to debounce.
 * @param delay - The delay period in milliseconds.
 * @returns A debounced version of the provided callback function.
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  cb: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        cb(...args);
      }, delay);
    },
    [cb, delay]
  );

  return debounced;
}
