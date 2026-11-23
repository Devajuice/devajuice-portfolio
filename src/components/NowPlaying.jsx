import { Volume2 } from 'runeicons-react';

export default function NowPlaying({ music }) {
  const loading = music === null;
  const failed = Boolean(music?.error);
  const track = music?.name && !failed ? music : null;

  return (
    <div className="card reveal flex items-center gap-3 p-3.5 sm:p-4">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-hover">
        {track?.art ? (
          <img src={track.art} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <Volume2 size={18} />
          </div>
        )}
        {track?.isLive && <span className="absolute right-1 bottom-1 h-2 w-2 rounded-full bg-live ring-2 ring-surface" aria-hidden="true" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-[0.08em] text-text-muted uppercase">{track?.isLive ? 'Listening now' : 'Last played'}</p>
        <p className="truncate text-sm font-medium text-text">{loading ? 'Loading music...' : track ? track.name : failed ? 'Music unavailable' : 'No recent track'}</p>
        <p className="truncate text-xs text-text-muted sm:text-sm">{track ? track.artist : loading ? 'Last.fm' : 'Check back later'}</p>
      </div>
    </div>
  );
}
