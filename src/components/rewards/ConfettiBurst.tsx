'use client';

import type { CSSProperties } from 'react';

type ConfettiStyle = CSSProperties & {
  '--confetti-drift': string;
};

const confettiPieces = [
  { left: '8%', delay: '0ms', color: '#2563eb', size: 8, drift: '-24px' },
  { left: '16%', delay: '120ms', color: '#f59e0b', size: 10, drift: '18px' },
  { left: '24%', delay: '60ms', color: '#10b981', size: 7, drift: '-12px' },
  { left: '34%', delay: '180ms', color: '#ef4444', size: 9, drift: '26px' },
  { left: '45%', delay: '20ms', color: '#7c3aed', size: 8, drift: '-18px' },
  { left: '56%', delay: '140ms', color: '#06b6d4', size: 11, drift: '16px' },
  { left: '66%', delay: '80ms', color: '#f97316', size: 7, drift: '-28px' },
  { left: '76%', delay: '200ms', color: '#22c55e', size: 10, drift: '20px' },
  { left: '86%', delay: '40ms', color: '#3b82f6', size: 8, drift: '-16px' },
  { left: '94%', delay: '160ms', color: '#eab308', size: 9, drift: '24px' },
];

export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {confettiPieces.map((piece, index) => {
        const pieceStyle: ConfettiStyle = {
            left: piece.left,
            width: piece.size,
            height: Math.max(5, piece.size - 2),
            backgroundColor: piece.color,
            animation: `cinarai-confetti 1400ms ease-out ${piece.delay} forwards`,
            transform: `rotate(${index * 27}deg)`,
            '--confetti-drift': piece.drift,
        };

        return (
          <span
            key={`${piece.left}-${piece.delay}`}
            className="absolute top-0 rounded-sm opacity-0"
            style={pieceStyle}
          />
        );
      })}
      <style jsx>{`
        @keyframes cinarai-confetti {
          0% {
            opacity: 0;
            transform: translate3d(0, -12px, 0) rotate(0deg);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--confetti-drift), 220px, 0) rotate(220deg);
          }
        }
      `}</style>
    </div>
  );
}
