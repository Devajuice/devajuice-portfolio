import React, { useEffect } from 'react';

export function triggerConfetti() {
  const colors = ['#3b82f6','#60a5fa','#818cf8','#34d399','#f59e0b','#f472b6','#a78bfa'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;border-radius:${Math.random()>0.5?'50%':'2px'};animation-delay:${Math.random()*0.8}s;animation-duration:${Math.random()*1.5+1.5}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

export default function EasterEgg({ open, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div id="easterEggOverlay" className={`easter-egg-overlay${open?' open':''}`}
      aria-hidden={!open} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="easter-egg-panel">
        <div className="easter-egg-header">
          <span className="easter-egg-icon">🎮</span>
          <span className="easter-egg-title">Achievement Unlocked!</span>
        </div>
        <p className="easter-egg-subtitle">↑ ↑ ↓ ↓ ← → ← → B A</p>
        <p className="easter-egg-desc">You found the Konami Code Easter Egg.<br />Clearly a person of culture. 🕹️</p>
        <div className="easter-egg-badge">+30 Gamer Points</div>
        <button className="easter-egg-close" onClick={onClose}>Nice, thanks!</button>
      </div>
    </div>
  );
}
