import { memo, useEffect, useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { motionTransitions } from '../../lib/motion-tokens';

/**
 * EasyUI · Airport Matrix Clock
 *
 * A live world clock that renders local times and city names as dot-matrix
 * characters. Each glyph cell rolls vertically when its character changes, and
 * the whole row re-rolls when the pointer enters it.
 *
 * Ported from easyui.site to JSX with the design tokens swapped in. The
 * upstream component is theme-aware; this site is dark-only, so the light
 * values and every `dark:` variant are gone rather than duplicated.
 */

export const AIRPORT_MATRIX_CITIES = {
  'new-delhi': { name: 'New Delhi', country: 'India', timeZone: 'Asia/Kolkata' },
  mumbai: { name: 'Mumbai', country: 'India', timeZone: 'Asia/Kolkata' },
  bengaluru: { name: 'Bengaluru', country: 'India', timeZone: 'Asia/Kolkata' },
  hyderabad: { name: 'Hyderabad', country: 'India', timeZone: 'Asia/Kolkata' },
  chennai: { name: 'Chennai', country: 'India', timeZone: 'Asia/Kolkata' },
  kolkata: { name: 'Kolkata', country: 'India', timeZone: 'Asia/Kolkata' },
  lucknow: { name: 'Lucknow', country: 'India', timeZone: 'Asia/Kolkata' },
  ahmedabad: { name: 'Ahmedabad', country: 'India', timeZone: 'Asia/Kolkata' },
  pune: { name: 'Pune', country: 'India', timeZone: 'Asia/Kolkata' },
  jaipur: { name: 'Jaipur', country: 'India', timeZone: 'Asia/Kolkata' },
  varanasi: { name: 'Varanasi', country: 'India', timeZone: 'Asia/Kolkata' },
  'new-york': { name: 'New York', country: 'United States', timeZone: 'America/New_York' },
  'los-angeles': { name: 'Los Angeles', country: 'United States', timeZone: 'America/Los_Angeles' },
  'san-francisco': { name: 'San Francisco', country: 'United States', timeZone: 'America/Los_Angeles' },
  chicago: { name: 'Chicago', country: 'United States', timeZone: 'America/Chicago' },
  houston: { name: 'Houston', country: 'United States', timeZone: 'America/Chicago' },
  miami: { name: 'Miami', country: 'United States', timeZone: 'America/New_York' },
  seattle: { name: 'Seattle', country: 'United States', timeZone: 'America/Los_Angeles' },
  boston: { name: 'Boston', country: 'United States', timeZone: 'America/New_York' },
  london: { name: 'London', country: 'United Kingdom', timeZone: 'Europe/London' },
  manchester: { name: 'Manchester', country: 'United Kingdom', timeZone: 'Europe/London' },
  birmingham: { name: 'Birmingham', country: 'United Kingdom', timeZone: 'Europe/London' },
  edinburgh: { name: 'Edinburgh', country: 'United Kingdom', timeZone: 'Europe/London' },
  glasgow: { name: 'Glasgow', country: 'United Kingdom', timeZone: 'Europe/London' },
  dubai: { name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai' },
  'abu-dhabi': { name: 'Abu Dhabi', country: 'United Arab Emirates', timeZone: 'Asia/Dubai' },
  sharjah: { name: 'Sharjah', country: 'United Arab Emirates', timeZone: 'Asia/Dubai' },
  tokyo: { name: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo' },
  osaka: { name: 'Osaka', country: 'Japan', timeZone: 'Asia/Tokyo' },
  kyoto: { name: 'Kyoto', country: 'Japan', timeZone: 'Asia/Tokyo' },
  nagoya: { name: 'Nagoya', country: 'Japan', timeZone: 'Asia/Tokyo' },
  yokohama: { name: 'Yokohama', country: 'Japan', timeZone: 'Asia/Tokyo' },
};

const DEFAULT_CITIES = ['los-angeles', 'london', 'tokyo'];
const MAX_CITIES = 5;
// Joins city IDs into a single memo key. NUL because it cannot occur in a slug.
const SIGNATURE_SEP = '\u0000';
const SUPPORTED_COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Japan',
];

const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ':': ['00000', '00100', '00100', '00000', '00100', '00100', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

const DOTS = Array.from({ length: 35 }, (_, index) => ({ x: index % 5, y: Math.floor(index / 5) }));

// Diameter of one dot, in the glyph's 5x7 user units.
const DOT_DIAMETER = 0.68;

// One <path> per character holding all 35 dots; the unlit dots are drawn once
// underneath at low opacity, so a cell costs two paths regardless of the glyph.
function createDotPath(char) {
  // Each lit dot is one zero-length subpath, `M x,y h 0`, painted with a round
  // linecap rather than a pair of arc commands. A zero-length subpath with
  // stroke-linecap="round" renders as a dot, which is ~9x shorter to write than
  // the arc form and 9x fewer path commands for the renderer to parse — this
  // component draws ~30 glyph cells at a time, so the path strings are the
  // heaviest thing it emits.
  return DOTS.filter(({ x, y }) => char === null || GLYPHS[char][y][x] === '1')
    .map(({ x, y }) => `M${x},${y}h0`)
    .join('');
}

const INACTIVE_DOT_PATH = createDotPath(null);
const GLYPH_PATHS = Object.fromEntries(
  Object.keys(GLYPHS).map((char) => [char, createDotPath(char)])
);

function resolveCities(requested) {
  const candidates = requested?.length ? requested : DEFAULT_CITIES;
  const seen = new Set();
  const valid = candidates
    .filter((id) => {
      if (!Object.prototype.hasOwnProperty.call(AIRPORT_MATRIX_CITIES, id)) {
        if (import.meta.env.DEV) console.warn(`[AirportMatrixClock] Ignoring unsupported city: "${id}"`);
        return false;
      }
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, MAX_CITIES);
  return valid.length ? valid : DEFAULT_CITIES;
}

function formatCityTime(date, timeZone, format, showSeconds) {
  const formatter = new Intl.DateTimeFormat(format === '24h' ? 'en-GB' : 'en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
    ...(format === '24h' ? { hourCycle: 'h23' } : { hour12: true }),
  });
  const parts = formatter.formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
  const hour = part('hour').padStart(2, '0');
  const minute = part('minute');
  const second = showSeconds ? `:${part('second')}` : '';
  const period = format === '12h' ? ` ${part('dayPeriod').toUpperCase()}` : '';
  return `${hour}:${minute}${second}${period}`;
}

const MatrixGlyph = memo(function MatrixGlyph({ char }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-0.5 -0.5 5 7"
      className="block h-auto w-[clamp(10px,3.4vw,20px)] overflow-visible"
      stroke="currentColor"
      strokeWidth={DOT_DIAMETER}
      strokeLinecap="round"
    >
      <path d={INACTIVE_DOT_PATH} fill="none" opacity="0.14" />
      <path d={GLYPH_PATHS[char] ?? GLYPH_PATHS[' ']} fill="none" />
    </svg>
  );
});

// Each cell keeps a hidden glyph in normal flow for sizing, so the rolling
// character above it can move without reflowing the row.
const MatrixCharacter = memo(function MatrixCharacter({ char, index, reduceMotion, rebuildId }) {
  const shouldAnimate = rebuildId > 0 && !reduceMotion;
  return (
    <span
      className="relative inline-flex w-[clamp(10px,3.4vw,20px)] shrink-0 items-center justify-center overflow-hidden align-middle"
      aria-hidden="true"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.span
          key={rebuildId}
          initial={shouldAnimate ? { y: '72%', opacity: 0.45 } : false}
          animate={{ y: '0%', opacity: 1 }}
          exit={shouldAnimate ? { y: '-72%', opacity: 0.45 } : { opacity: 0 }}
          transition={
            shouldAnimate
              ? { ...motionTransitions.springSnappy, delay: Math.min(index * 0.012, 0.09) }
              : { duration: 0 }
          }
          className="absolute inset-0 flex items-center justify-center"
        >
          <MatrixGlyph char={char} />
        </motion.span>
      </AnimatePresence>
      <span className="invisible">
        <MatrixGlyph char="0" />
      </span>
    </span>
  );
});

const MatrixText = memo(function MatrixText({ text, reduceMotion, rebuildId, label, className = '' }) {
  return (
    <span
      aria-label={label}
      className={`inline-flex min-w-0 items-center gap-[clamp(0.5px,0.2vw,2px)] text-current ${className}`}
    >
      <span aria-hidden="true" className="sr-only">
        {label}
      </span>
      {Array.from(text.toUpperCase()).map((char, index) => (
        <MatrixCharacter
          key={index}
          char={GLYPHS[char] ? char : ' '}
          index={index}
          reduceMotion={reduceMotion}
          rebuildId={rebuildId}
        />
      ))}
    </span>
  );
});

const CountryLabel = memo(function CountryLabel({ country, rebuildId, reduceMotion }) {
  const still = rebuildId === 0 || reduceMotion;
  return (
    <span className="mt-1 block break-words font-mono text-[8px] tracking-[0.12em] text-text-secondary">
      {Array.from(country.toUpperCase()).map((char, index) =>
        char === ' ' ? (
          ' '
        ) : (
          <motion.span
            key={`${index}-${char}-${rebuildId}`}
            aria-hidden="true"
            initial={still ? false : { opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={still ? { duration: 0 } : { ...motionTransitions.easeFast, delay: Math.min(index * 0.008, 0.08) }}
            className="inline-block"
          >
            {char}
          </motion.span>
        )
      )}
    </span>
  );
});

const AirportMatrixClockRow = memo(function AirportMatrixClockRow({
  row,
  rowCount,
  isLast,
  showCountry,
  showControls,
  reduceMotion,
  onRemove,
}) {
  // Bumping rebuildId replays the roll on every glyph in the row, so hovering a
  // row re-rolls it rather than only rolling the digits that happened to change.
  const [rebuildId, setRebuildId] = useState(0);
  const handlePointerEnter = (event) => {
    if (!reduceMotion && event.pointerType !== 'touch') setRebuildId((current) => current + 1);
  };

  return (
    <li
      onPointerEnter={handlePointerEnter}
      className={`grid items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 ${
        showControls
          ? 'grid-cols-[minmax(66px,0.72fr)_minmax(0,1.28fr)_22px] sm:grid-cols-[minmax(112px,0.72fr)_minmax(0,1.28fr)_24px]'
          : 'grid-cols-[minmax(84px,0.8fr)_minmax(0,1.2fr)] sm:grid-cols-[minmax(140px,0.8fr)_minmax(0,1.2fr)]'
      } ${isLast ? '' : 'border-b border-border-subtle'}`}
    >
      <div className="min-w-0 text-text-primary">
        <MatrixText
          text={row.time}
          label={`${row.time}, ${row.name}`}
          reduceMotion={reduceMotion}
          rebuildId={rebuildId}
        />
      </div>
      <div className="min-w-0 text-text-primary">
        <MatrixText text={row.name} label={row.name} reduceMotion={reduceMotion} rebuildId={rebuildId} />
        {showCountry && <CountryLabel country={row.country} rebuildId={rebuildId} reduceMotion={reduceMotion} />}
      </div>
      {showControls && (
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          disabled={rowCount <= 1}
          aria-label={`Remove ${row.name}`}
          className="focus-ring flex h-6 w-6 cursor-pointer items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </li>
  );
});

/**
 * @param cities        One to five IDs from AIRPORT_MATRIX_CITIES. Omit to show
 *                      the built-in city editor.
 * @param format        '24h' (airport-board style) or '12h'.
 * @param showSeconds   Include seconds in each city time.
 * @param showCountry   Print each city's country beneath its name.
 * @param updateInterval Tick period in ms. Defaults to 1s with seconds shown and
 *                      30s otherwise, so a minutes-only clock is not re-rendering
 *                      once a second for no visual change.
 * @param showControls  Force the city editor on or off. Defaults to on when
 *                      `cities` is omitted.
 */
export function AirportMatrixClock({
  cities,
  format = '24h',
  showSeconds = false,
  updateInterval,
  showCountry = false,
  showControls,
  onCitiesChange,
  className = '',
}) {
const reduceMotion = useReducedMotion() ?? false;
  const [now, setNow] = useState(() => Date.now());
  const [internalCities, setInternalCities] = useState(() => resolveCities(cities));
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedCity, setSelectedCity] = useState('chicago');
  const countrySelectId = useId();
  const citySelectId = useId();

  // Without a `cities` prop the editor owns the list; with one, the caller does.
  // Upstream mirrors the prop into state via an effect so the two can interop;
  // reading it directly instead removes that sync effect entirely.
  const ownsList = cities === undefined;
  const canEdit = ownsList || typeof onCitiesChange === 'function';
  const controlsVisible = (showControls ?? ownsList) && canEdit;

  // Keying the memo on a signature rather than the array itself keeps `cities`
  // memo-stable when a caller passes an inline literal, which would otherwise
  // re-render every memoised row on each tick.
  const activeSignature = cities ? cities.join(SIGNATURE_SEP) : internalCities.join(SIGNATURE_SEP);
  const selectedCities = useMemo(
    () => resolveCities(activeSignature.split(SIGNATURE_SEP)),
    [activeSignature]
  );
  const countryCityIds = useMemo(
    () => Object.keys(AIRPORT_MATRIX_CITIES).filter((id) => AIRPORT_MATRIX_CITIES[id].country === selectedCountry),
    [selectedCountry]
  );

  const updateCities = (nextCities) => {
    if (ownsList) setInternalCities(nextCities);
    onCitiesChange?.(nextCities);
  };

  const handleAddCity = () => {
    if (selectedCities.length >= MAX_CITIES || selectedCities.includes(selectedCity)) return;
    const nextCities = [...selectedCities, selectedCity];
    updateCities(nextCities);
    const nextAvailable = countryCityIds.find((id) => id !== selectedCity && !nextCities.includes(id));
    if (nextAvailable) setSelectedCity(nextAvailable);
  };

  const handleRemoveCity = (id) => {
    if (selectedCities.length <= 1) return;
    updateCities(selectedCities.filter((cityId) => cityId !== id));
  };

  useEffect(() => {
    const period =
      updateInterval ?? (showSeconds ? 1000 : 30000);
    const safe = Number.isFinite(period) && period > 0 ? period : 1000;
    const timer = window.setInterval(() => setNow(Date.now()), safe);
    return () => window.clearInterval(timer);
  }, [updateInterval, showSeconds]);

  const rows = useMemo(
    () =>
      selectedCities.map((id) => {
        const city = AIRPORT_MATRIX_CITIES[id];
        return {
          id,
          name: city.name,
          country: city.country,
          time: formatCityTime(new Date(now), city.timeZone, format, showSeconds),
        };
      }),
    [selectedCities, now, format, showSeconds]
  );

  return (
    <section
      aria-label={`World times: ${rows.map((row) => `${row.time} ${row.name}`).join(', ')}`}
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-surface-hover text-text-primary [--amc-grid:rgba(242,242,243,0.014)] ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(var(--amc-grid) 1px, transparent 1px), linear-gradient(90deg, var(--amc-grid) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-text-muted">WORLD CLOCK</p>
      </header>
      <ul className="m-0 list-none p-0">
        {rows.map((row, index) => (
          <AirportMatrixClockRow
            key={row.id}
            row={row}
            rowCount={rows.length}
            isLast={index === rows.length - 1}
            showCountry={showCountry}
            showControls={controlsVisible}
            reduceMotion={reduceMotion}
            onRemove={handleRemoveCity}
          />
        ))}
      </ul>
      {controlsVisible && (
        <div className="border-t border-border px-3 py-3 sm:px-5">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] tracking-[0.12em] text-text-muted">
            <span>ADD A CITY</span>
            <span>
              {selectedCities.length} / {MAX_CITIES} CITIES
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto] gap-1.5 sm:gap-2">
            <label className="sr-only" htmlFor={countrySelectId}>
              Country
            </label>
            <select
              id={countrySelectId}
              value={selectedCountry}
              onChange={(event) => {
                const country = event.target.value;
                setSelectedCountry(country);
                const firstAvailable = Object.keys(AIRPORT_MATRIX_CITIES).find(
                  (id) => AIRPORT_MATRIX_CITIES[id].country === country && !selectedCities.includes(id)
                );
                const firstInCountry =
                  Object.keys(AIRPORT_MATRIX_CITIES).find(
                    (id) => AIRPORT_MATRIX_CITIES[id].country === country
                  ) ?? 'new-york';
                setSelectedCity(firstAvailable ?? firstInCountry);
              }}
              className="focus-ring min-w-0 cursor-pointer rounded-md border border-border bg-surface-raised px-2 py-2 font-sans text-[10px] text-text-primary outline-none transition-colors focus-visible:border-border-hover"
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={citySelectId}>
              City
            </label>
            <select
              id={citySelectId}
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="focus-ring min-w-0 cursor-pointer rounded-md border border-border bg-surface-raised px-2 py-2 font-sans text-[10px] text-text-primary outline-none transition-colors focus-visible:border-border-hover"
            >
              {countryCityIds.map((id) => (
                <option key={id} value={id}>
                  {AIRPORT_MATRIX_CITIES[id].name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCity}
              disabled={selectedCities.length >= MAX_CITIES || selectedCities.includes(selectedCity)}
              className="focus-ring rounded-md bg-text-primary px-3 py-2 font-sans text-[10px] font-medium text-bg transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}
      {!controlsVisible && (
        <footer className="border-t border-border px-3 py-2 font-mono text-[9px] tracking-[0.12em] text-text-muted sm:px-5">
          {rows.length} CITIES <span className="px-1.5 opacity-50">/</span> IANA TIME ZONES
        </footer>
      )}
    </section>
  );
}

export default AirportMatrixClock;