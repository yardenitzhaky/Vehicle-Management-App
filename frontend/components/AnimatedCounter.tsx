'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';

// Custom hook for previous value
function usePrevious(value: number) {
  const ref = useRef<number>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Animated counter component
export function AnimatedCounter({ value }: { value: number }) {
  const prevValue = usePrevious(value) || 0;
  const [displayValue, setDisplayValue] = useState(prevValue);

  useEffect(() => {
    const controls = animate(prevValue, value, {
      duration: 0.5,
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, prevValue]);

  return <motion.span>{displayValue}</motion.span>;
}
