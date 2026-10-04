/**
 * Animated 4-bar equalizer. Animates only while `live` is true so a stale
 * "recently played" track doesn't look like it's still playing.
 */
export default function Equalizer({ live = false, className = '' }) {
  const bars = ['animate-eq-1', 'animate-eq-2', 'animate-eq-3', 'animate-eq-4'];

  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-end justify-between gap-[2px] ${
        live ? 'text-live' : 'text-text-subtle'
      } ${className}`}
      aria-hidden="true"
    >
      {bars.map((animation, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-current ${live ? animation : 'h-[3px]'}`}
          style={live ? { animationDelay: `${i * 0.08}s` } : undefined}
        />
      ))}
    </span>
  );
}
