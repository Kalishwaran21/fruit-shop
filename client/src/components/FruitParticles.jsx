import { useEffect, useState } from 'react';

const FRUITS = ['🍎', '🍌', '🥭', '🍇', '🍊', '🍓', '🍋', '🍑', '🍒', '🫐', '🍈', '🥝'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FruitParticles({ count = 18 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: FRUITS[i % FRUITS.length],
      left: `${randomBetween(2, 96)}%`,
      fontSize: `${randomBetween(1.2, 2.8)}rem`,
      duration: `${randomBetween(8, 20)}s`,
      delay: `${randomBetween(0, 12)}s`,
      opacity: randomBetween(0.08, 0.2),
    }))
  );

  return (
    <div className="fruit-particles-container" aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="fruit-particle"
          style={{
            left: p.left,
            fontSize: p.fontSize,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: 0,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
