import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly animates a number from 0 to the target value.
 * @param {number} target - The target value to count up to.
 * @param {number} duration - Animation duration in ms (default 1500ms).
 * @returns {number} - The current animated value.
 */
export default function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}
