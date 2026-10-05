import { useCallback, useState } from 'react';
import AirportMatrixClock, { AIRPORT_MATRIX_CITIES } from '../ui/AirportMatrixClock';
import Button from '../ui/Button';

/**
 * The full editable world clock. The component owns its own city list when no
 * `cities` prop is given (which is what turns on its editor), so all this has
 * to do is seed that list from storage and write changes back.
 */

const STORAGE_KEY = 'worldClockCities';

// Kept in sync with the component's own MAX_CITIES so a bad storage value
// written by an older build can never ask for more rows than it can render.
const MAX_SAVED = 5;

const FALLBACK = ['dubai', 'london', 'tokyo'];

function readSavedCities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return FALLBACK;
    const valid = parsed.filter((id) => Object.prototype.hasOwnProperty.call(AIRPORT_MATRIX_CITIES, id));
    return valid.length ? valid.slice(0, MAX_SAVED) : FALLBACK;
  } catch {
    // Private-browsing modes throw on localStorage access, and a corrupt value
    // throws on JSON.parse. Either way the clock still works, just unpinned.
    return FALLBACK;
  }
}

export default function WorldClockToy() {
  // Lazy initialiser: parse once at mount rather than on every render.
  const [cities, setCities] = useState(readSavedCities);

  const handleChange = useCallback((next) => {
    setCities(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — the picker still works for this session */
    }
  }, []);

  const reset = () => handleChange(FALLBACK);

  const isPinned = cities.join() !== FALLBACK.join();

  return (
    <div>
      {/* `cities` is passed, so the component treats the list as caller-owned
          and leaves the editor off unless `showControls` says otherwise. */}
      <AirportMatrixClock
        cities={cities}
        format="24h"
        showCountry
        showControls
        onCitiesChange={handleChange}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.12em] text-text-subtle">
          YOUR SELECTION IS SAVED TO THIS BROWSER
        </p>
        <Button variant="secondary" size="sm" onClick={reset} disabled={!isPinned}>
          Reset
        </Button>
      </div>
    </div>
  );
}