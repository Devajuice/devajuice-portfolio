import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Volume2 } from 'runeicons-react';
import { motionTransitions } from '../lib/motion-tokens';

function formatPlayedAt(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function trackHref(track) {
  return `https://music.youtube.com/search?q=${encodeURIComponent(`${track?.name || ''} ${track?.artist || ''}`.trim())}`;
}

function TrackRow({ track, isCurrent }) {
  const href = trackHref(track);
  const when = track.isLive ? 'Now' : formatPlayedAt(track.playedAt);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-hover"
      title={`Open "${track.name}"`}
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-hover">
        {track.art ? (
          <img
            src={track.art}
            alt={track.album ? `${track.album} cover art` : ''}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <Volume2 size={16} aria-hidden="true" />
          </div>
        )}
        {track.isLive && (
          <span className="absolute right-1 bottom-1 flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live ring-2 ring-surface" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-text transition-colors group-hover:text-text-secondary">
          {track.name}
        </p>
        <p className="truncate font-mono text-[11px] text-text-muted">
          {track.artist}
          {track.album && track.album !== 'Unknown Album' ? <span className="text-text-subtle"> · {track.album}</span> : null}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {isCurrent && !track.isLive ? (
          <span className="font-mono text-[10px] tracking-[0.04em] text-text-subtle uppercase">Latest</span>
        ) : when ? (
          <span className={`font-mono text-[10px] tracking-[0.04em] uppercase ${track.isLive ? 'text-live' : 'text-text-subtle'}`}>
            {when}
          </span>
        ) : null}
      </div>
    </a>
  );
}

export default function NowPlaying({ music }) {
  const loading = music === null;
  const failed = Boolean(music?.error);
  const track = music?.name && !failed ? music : null;
  const recentTracks = Array.isArray(music?.recentTracks) ? music.recentTracks.filter((t) => t?.name) : [];
  const dropdownTracks = recentTracks.slice(0, 5);
  const hasDropdown = dropdownTracks.length > 0;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!hasDropdown && open) setOpen(false);
  }, [hasDropdown, open]);

  return (
    <section aria-label="Now playing" className="card p-4 sm:p-5" ref={rootRef}>
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-hover">
          {track?.art ? (
            <img
              src={track.art}
              alt={track.album ? `${track.album} cover art` : ''}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-subtle">
              <Volume2 size={20} aria-hidden="true" />
            </div>
          )}
          {track?.isLive && (
            <span className="absolute right-1.5 bottom-1.5 flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-30" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live ring-2 ring-surface" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-text-muted uppercase">
            {track?.isLive ? 'Listening now' : 'Last played'}
          </p>
          {track ? (
            <a
              href={trackHref(track)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-1 block truncate rounded-sm text-sm font-medium text-text underline decoration-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:decoration-text sm:text-[15px]"
              title={`Open "${track.name}"`}
            >
              {track.name}
            </a>
          ) : (
            <p className="mt-1 truncate text-sm font-medium text-text sm:text-[15px]">
              {loading ? 'Loading music...' : failed ? 'Music unavailable' : 'No recent track'}
            </p>
          )}
          <p className="truncate font-mono text-[12px] text-text-muted">
            {track ? track.artist : loading ? 'Connecting to Last.fm' : 'Check back later'}
          </p>
        </div>

        {hasDropdown && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface/70 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            aria-label={open ? 'Hide recent tracks' : 'Show recent tracks'}
            aria-expanded={open}
            aria-controls="recent-tracks-dropdown"
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reducedMotion ? { duration: 0 } : motionTransitions.easeFast}
              className="inline-flex"
            >
              <ChevronDown size={16} aria-hidden="true" />
            </motion.span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && hasDropdown && (
          <motion.div
            id="recent-tracks-dropdown"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto', y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -4 }}
            transition={reducedMotion ? { duration: 0.12 } : motionTransitions.springGentle}
            className="overflow-hidden"
          >
            <div className="mt-4 -mx-1 border-t border-border px-1 pt-3">
              <p className="mb-2 px-2.5 font-mono text-[11px] font-medium tracking-[0.08em] text-text-muted uppercase">
                Recently played
              </p>
              <div className="flex flex-col gap-0.5" role="list">
                {dropdownTracks.map((t, i) => (
                  <div key={`${t.name}-${t.artist}-${t.playedAt ?? 'live'}-${i}`} role="listitem">
                    <TrackRow track={t} isCurrent={i === 0} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
