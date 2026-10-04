import { Radio, Music } from 'lucide-react';

/**
 * Shared "Live" / "Recent" pill. Green is reserved exclusively for an actively
 * playing track; the idle state stays monochrome so green always means "now".
 */
export default function LiveBadge({ live = false, className = '' }) {
  const Icon = live ? Radio : Music;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
        live
          ? 'border-live-border bg-live-badge text-live'
          : 'border-border bg-surface-2/40 text-text-muted'
      } ${className}`}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {live ? 'Live' : 'Recent'}
    </span>
  );
}
