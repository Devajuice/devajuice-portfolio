import { useTypewriter, useTimezone } from '../hooks';
import { useToast } from './useToast';
import { playSound } from '../utils/audio';
import MagneticButton from './ui/MagneticButton';
import Equalizer from './ui/Equalizer';
import { FolderOpen, Send, FileDown, Clock, Music } from 'lucide-react';

function NowPlayingPill({ musicData }) {
  const isLoading = musicData === null;
  const hasFailed = Boolean(musicData?.error);
  const isLive = musicData?.isLive;
  const hasTrack = Boolean(musicData?.name);

  // Shared pill chrome.
  // `min-w-0` is load-bearing: the pill is the flex item inside the wrapper, and
  // a flex item defaults to `min-width: auto`, i.e. it refuses to shrink below
  // its content. The track name is `white-space: nowrap`, so without this a long
  // title pushed the pill past the viewport even though the text had `truncate`.
  // `justify-center` (rather than `flex-1` on the text) keeps the group optically
  // centred instead of left-weighted with an empty tail on the right.
  const shell =
    'relative flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full border px-3.5 py-2 text-center text-xs sm:w-auto sm:max-w-md sm:gap-2.5 sm:px-4';
  const status = { role: 'status', 'aria-live': 'polite' };

  if (isLoading) {
    return (
      <div
        {...status}
        aria-label="Loading music data"
        className={`animate-pulse ${shell} border-border bg-surface font-medium text-text-muted shadow-subtle`}
      >
        Loading…
      </div>
    );
  }

  // The Last.fm poll can fail (offline, rate limited, missing API key) or
  // return no scrobbles at all. Fall back to an explicit state instead of
  // rendering an empty "Last Played" pill with no track name.
  if (hasFailed || !hasTrack) {
    return (
      <div className={`${shell} border-border bg-surface text-text-secondary shadow-subtle`} {...status}>
        <Music className="h-3.5 w-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
        <span className="relative z-10 hidden shrink-0 font-semibold tracking-[0.08em] uppercase opacity-80 sm:inline">
          Now Playing
        </span>
        <span className="relative z-10 min-w-0 max-w-full truncate text-text-muted">
          <span className="sm:hidden">Now Playing · </span>
          {hasFailed ? 'Unavailable' : 'No recent tracks'}
        </span>
      </div>
    );
  }

  const label = isLive ? 'Now Playing' : 'Last Played';

  return (
    <div
      {...status}
      className={`${shell} transition-colors duration-500 ${
        isLive
          ? 'border-live-border bg-live-soft text-live shadow-[0_4px_20px_var(--color-live-glow)]'
          : 'border-border bg-surface text-text-secondary shadow-elevated'
      }`}
    >
      {musicData.art && (
        <>
          {/* Full-bleed artwork. Scaled past the edges so the blur never
              samples transparent pixels; the pill's own `overflow-hidden` with
              `rounded-full` clips it cleanly, so no edge mask is needed. A mask
              here just produced a blotchy vignette on a pill this short. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-[var(--art-alpha)] blur-[10px] saturate-150"
            style={{ backgroundImage: `url('${musicData.art}')` }}
          />
          <div aria-hidden="true" className="glass-art pointer-events-none absolute inset-0 rounded-full" />
        </>
      )}
      <Equalizer live={Boolean(isLive)} className="relative z-10" />
      <span className="relative z-10 hidden shrink-0 font-semibold tracking-[0.08em] uppercase opacity-80 sm:inline">
        {label}
      </span>
      <span className="relative z-10 min-w-0 max-w-full truncate font-medium">
        <span className="sm:hidden">{label} · </span>
        <span className="text-text-primary">{`${musicData.name} — ${musicData.artist}`}</span>
      </span>
    </div>
  );
}

export default function HomeSection({ onNavigate, musicData }) {
  const typewriterText = useTypewriter(['Student', 'Developer', 'Gamer']);
  const timezone = useTimezone();
  const showToast = useToast();

  const handleResumeClick = () => {
    playSound('success');
    showToast(
      '<i class="fas fa-file-arrow-down" style="margin-right:6px"></i> Downloading resume…',
      'info',
      2500
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      {/* Availability badge */}
      <div className="animate-fade-up rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary shadow-subtle">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-text-primary align-middle" />
        Available for work
      </div>

      <h1
        id="home-heading"
        className="animate-stagger-fade-up mt-6 text-5xl font-bold tracking-tighter text-text-primary sm:text-6xl md:text-7xl"
        style={{ animationDelay: '0.05s' }}
      >
        Hi, I&#39;m{' '}
        <span className="bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
          Devajith
        </span>
      </h1>

      <p
        className="animate-stagger-fade-up mt-3 text-xl text-text-secondary sm:text-2xl"
        style={{ animationDelay: '0.1s' }}
      >
        <span>{typewriterText}</span>
        <span className="ml-0.5 inline-block animate-cursor-blink text-text-primary">|</span>
      </p>

      <p
        className="animate-stagger-fade-up mt-6 max-w-xl text-base leading-relaxed text-text-muted"
        style={{ animationDelay: '0.15s' }}
      >
        Building efficient solutions through code and data analysis. Passionate about technology,
        learning, and creating meaningful projects.
      </p>

      <div
        className="animate-stagger-fade-up mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs text-text-secondary shadow-subtle"
        role="status"
        aria-live="polite"
      >
        <Clock className="h-3 w-3" aria-hidden="true" />
        <span>{timezone.time}</span>
        <span className="text-text-subtle">·</span>
        <span>{timezone.label}</span>
      </div>

      <div
        className="animate-stagger-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: '0.2s' }}
      >
        <MagneticButton variant="primary" onClick={() => onNavigate('projects')}>
          <FolderOpen className="h-4 w-4" aria-hidden="true" />
          <span>View Projects</span>
        </MagneticButton>

        <MagneticButton variant="secondary" onClick={() => onNavigate('contact')}>
          <Send className="h-4 w-4" aria-hidden="true" />
          <span>Contact Me</span>
        </MagneticButton>

        <MagneticButton
          as="a"
          variant="ghost"
          href="/assets/docs/Devajith_Resume.pdf"
          download="Devajith_Resume.pdf"
          aria-label="Download Resume"
          onClick={handleResumeClick}
        >
          <FileDown className="h-4 w-4" aria-hidden="true" />
          <span>Resume</span>
        </MagneticButton>
      </div>

      <div
        className="animate-stagger-fade-up mt-12 flex w-full justify-center"
        style={{ animationDelay: '0.3s' }}
      >
        <NowPlayingPill musicData={musicData} />
      </div>
    </div>
  );
}
