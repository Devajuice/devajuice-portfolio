import React from 'react';

const HOBBIES = [
  {
    icon: 'fa-gamepad',
    title: 'Gaming',
    desc: 'Passionate about competitive gaming and exploring virtual worlds. Favorite genres include strategy and multiplayer experiences.',
  },
  {
    icon: 'fa-music',
    title: 'Music',
    desc: 'Constantly discovering new artists and genres. Music fuels creativity and focus during coding sessions.',
  },
  {
    icon: 'fa-laptop-code',
    title: 'Tech Exploration',
    desc: 'Always tinkering with new technologies, frameworks, and tools. Love experimenting with side projects and learning.',
  },
];

export default function HobbiesSection() {
  return (
    <>
      <h2 id="hobbies-heading" className="section-title">
        <i className="fas fa-heart" aria-hidden="true" />
        <span>Hobbies &amp; Interests</span>
      </h2>
      <div className="grid-container">
        {HOBBIES.map((h) => (
          <div className="card" key={h.title}>
            <div className="card-icon">
              <i className={`fas ${h.icon}`} aria-hidden="true" />
            </div>
            <div className="card-content">
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
