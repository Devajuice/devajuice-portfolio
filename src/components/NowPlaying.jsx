import { Volume2 } from 'runeicons-react';

export default function NowPlaying({ music }) {
  const loading = music === null;
  const failed = Boolean(music?.error);
  const track = music?.name && !failed ? music : null;

  return (
    <section aria-label="Now playing" className="card flex items-center gap-4 p-4 sm:p-5">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-hover">
        {track?.art ? (
          <img src={track.art} alt={track.album ? `${track.album} cover art` : ''} className="h-full w-full object-cover" loading="lazy" decoding="async" />
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
            href={`https://music.youtube.com/search?q=${encodeURIComponent(`${track.name} ${track.artist}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-1 block truncate rounded-sm text-sm font-medium text-text underline decoration-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:decoration-text sm:text-[15px]"
            title={`Search "${track.name}" on YouTube Music`}
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
    </section>
  );
}
