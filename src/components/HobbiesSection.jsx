import SpotlightCard from './ui/SpotlightCard';

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
      <h2 id="hobbies-heading" className="section-heading">
        <i className="fas fa-heart" aria-hidden="true" />
        <span>Hobbies &amp; Interests</span>
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {HOBBIES.map((h) => (
          <SpotlightCard key={h.title} className="flex h-full flex-col">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-hover text-text-primary">
              <i className={`fas ${h.icon} text-base`} aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary">{h.title}</h3>
            <p className="text-sm leading-relaxed text-text-muted">{h.desc}</p>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
