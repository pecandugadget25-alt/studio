'use client';

import { useEffect, useState } from 'react';

type XpCounterProps = {
  value: number;
  durationMs?: number;
};

export function XpCounter({ value, durationMs = 900 }: XpCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, value);
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs, value]);

  return <span>{displayValue.toLocaleString('id-ID')}</span>;
}
