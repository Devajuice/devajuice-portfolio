import SpotlightCard from './ui/SpotlightCard';
import SmoothAccordion from './ui/SmoothAccordion';
import LiveBadge from './ui/LiveBadge';
import { Music, GraduationCap } from 'lucide-react';

const EDUCATION = [
  {
    id: 'bca',
    title: 'Bachelor of Computer Applications',
    subtitle: '2026 – Present · Current',
    icon: 'fa-university',
    current: true,
    desc: 'Pursuing a degree focused on computer science and cloud computing, building a strong foundation in algorithms, data structures, and modern cloud computing.',
  },
  {
    id: 'hse',
    title: 'Higher Secondary Education',
    subtitle: '2024 – 2026 · Completed',
    icon: 'fa-school',
    desc: 'Equipped with a robust quantitative background, I apply principles of logic and systematic problem-solving to drive efficiency in modern commerce and technology.',
  },
  {
    id: 'primary',
    title: 'Primary Education',
    subtitle: '2015 – 2024 · Completed',
    icon: 'fa-school',
    desc: 'Nine years at Abu Dhabi Indian School — the years that shaped how I approach learning and problems.',
  },
];

function MusicCard({ musicData }) {
  const isLive = musicData?.isLive;
  const hasTrack = musicData?.name && !musicData?.error;

  return (
    <div className="w-full">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-text-secondary uppercase">
        <Music className="h-4 w-4" aria-hidden="true" />
        <span>Currently Listening</span>
      </h3>

      <SpotlightCard
        className={`overflow-hidden p-5 ${isLive ? 'border-live-border hover:border-live-border' : ''}`}
        // Tint the cursor spotlight green while live so the whole card reacts.
        spotlightColor={isLive ? 'rgb(74 222 128 / 0.12)' : undefined}
        // SpotlightCard hardcodes `shadow-subtle`, which wins on CSS order, so
        // the live glow is applied inline to be certain it takes effect.
        style={isLive ? { boxShadow: '0 0 40px var(--color-live-glow)' } : undefined}
      >
        {hasTrack && musicData.art && (
          <>
            {/* Album art as a full-bleed backdrop. Scaled past the edges
                because a blur samples transparent pixels and would otherwise
                fade out at the container boundary. SpotlightCard clips with
                `overflow-hidden` + `rounded-xl`, which gives a clean edge —
                an edge mask only dimmed the corners. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 scale-120 bg-cover bg-center opacity-[var(--art-alpha)] blur-[32px] saturate-200"
              style={{ backgroundImage: `url('${musicData.art}')` }}
            />
            {/* Frosted glass pass so the blurred art reads as depth behind the
                card rather than a flat wallpaper. */}
            <div aria-hidden="true" className="glass-art pointer-events-none absolute inset-0 rounded-[inherit]" />
          </>
        )}

        <div className="relative z-10 flex items-center gap-4">
          {hasTrack && musicData.art && (
            <img
              className="h-16 w-16 shrink-0 rounded-lg object-cover shadow-subtle"
              src={musicData.art}
              alt={`${musicData.album} album cover`}
              loading="lazy"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <span className="truncate">{hasTrack ? musicData.name : 'Connect your Last.fm'}</span>
              {hasTrack && <LiveBadge live={isLive} />}
            </h4>
            <p className="mt-0.5 truncate text-sm text-text-muted">
              {hasTrack ? musicData.artist : ''}
            </p>
            <p className="truncate text-xs text-text-subtle">{hasTrack ? musicData.album : ''}</p>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

export default function AboutSection({ musicData }) {
  return (
    <>
      <h2 id="about-heading" className="section-heading">
        <i className="fas fa-user-circle" aria-hidden="true" />
        <span>About Me</span>
      </h2>

      <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-text-secondary">
        <p>
          I&#39;m a student passionate about technology and problem-solving. My journey in tech has
          been driven by curiosity and the desire to build solutions that make a difference. I
          specialize in Python development and data analysis, constantly exploring new technologies
          and methodologies.
        </p>
        <p>
          When I&#39;m not coding, you&#39;ll find me gaming, tinkering with new technologies, or
          listening to music. I believe in continuous learning and sharing knowledge with the
          community.
        </p>
      </div>

      <div className="mx-auto mt-14 w-full max-w-3xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-text-secondary uppercase">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          <span>Education</span>
        </h3>

        <SmoothAccordion
          allowMultiple
          defaultOpen={['bca']}
          items={EDUCATION.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            content: item.desc,
          }))}
        />
      </div>

      <div className="mx-auto mt-14 w-full max-w-3xl">
        <MusicCard musicData={musicData} />
      </div>
    </>
  );
}
