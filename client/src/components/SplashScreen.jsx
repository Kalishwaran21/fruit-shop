import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800);
    const t2 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'radial-gradient(ellipse at center, #064e3b 0%, #021408 70%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '24px',
      transition: 'opacity 0.6s ease',
      opacity: fade ? 0 : 1, pointerEvents: fade ? 'none' : 'all',
    }}>
      <div style={{ fontSize: '5rem', animation: 'heroFruitBounce 1s ease-in-out infinite' }}>
        🍎
      </div>
      <div style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.5rem',
        background: 'linear-gradient(135deg, #34d399, #fbbf24, #f87171)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}>
        FreshFruits Pro
      </div>
      <div style={{ color: '#86efac', fontFamily: 'Outfit, sans-serif', fontSize: '1rem', opacity: 0.7 }}>
        Loading your dashboard...
      </div>
      {/* Spinner */}
      <div style={{
        width: '36px', height: '36px',
        border: '3px solid rgba(52,211,153,0.2)',
        borderTop: '3px solid #34d399',
        borderRadius: '50%', animation: 'spinLoader 0.8s linear infinite',
      }} />
    </div>
  );
}
