import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'runeicons-react';
import { profile } from '../data/site';

const LEVEL_CLASS = [
  'bg-text/[0.06]',
  'bg-text/20',
  'bg-text/35',
  'bg-text/55',
  'bg-text/75',
];

function buildWeeks(contributions) {
  if (!contributions?.length) return [];
  const weeks = [];
  let week = [];

  // Pad start so first column aligns to weekday (Sun = 0)
  const firstDay = new Date(contributions[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < firstDay; i += 1) week.push(null);

  for (const day of contributions) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function GitHubActivity() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const year = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/devajuice?y=${year}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, [year]);

  const weeks = useMemo(() => buildWeeks(data?.contributions), [data]);
  const total = data?.total?.[year] ?? data?.total?.lastYear ?? 0;
  const months = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    for (let i = 0; i < weeks.length; i += 1) {
      const day = weeks[i].find((d) => d);
      if (!day) {
        labels.push('');
        continue;
      }
      const month = new Date(day.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        const lastLabelIndex = labels.findLastIndex((l) => l);
        if (lastLabelIndex === -1 || i - lastLabelIndex >= 3) {
          labels.push(new Date(day.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }));
          lastMonth = month;
        } else {
          labels.push('');
        }
      } else {
        labels.push('');
      }
    }
    return labels;
  }, [weeks]);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[12px] text-text-muted">
          {status === 'ready' ? `${total.toLocaleString()} contributions in ${year}` : 'GitHub contributions'}
        </p>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="muted-link focus-ring inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-mono text-[12px]">
          View profile <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>

      {status === 'loading' && <p className="mt-5 text-sm text-text-muted">Loading contributions...</p>}
      {status === 'error' && <p className="mt-5 text-sm text-text-muted">Could not load GitHub contributions right now.</p>}

      {status === 'ready' && (
        <div className="mt-5">
          <div className="overflow-x-auto pb-1">
            <div className="inline-grid grid-flow-col gap-[3px]" aria-hidden="true">
              {months.map((label, i) => (
                <span key={i} className="h-4 w-[10px] whitespace-nowrap font-mono text-[10px] leading-4 text-text-subtle sm:w-[11px]">
                  {label}
                </span>
              ))}
            </div>
            <div
              className="mt-1 inline-grid grid-flow-col gap-[3px]"
              role="img"
              aria-label={`${total} GitHub contributions in ${year}`}
            >
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-rows-7 gap-[3px]">
                  {week.map((day, di) => (
                    <span
                      key={day?.date || `${wi}-${di}`}
                      className={`h-[10px] w-[10px] rounded-[2px] sm:h-[11px] sm:w-[11px] ${day ? LEVEL_CLASS[day.level] || LEVEL_CLASS[0] : 'bg-transparent'}`}
                      title={day ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}` : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-text-subtle" aria-hidden="true">
            <span>Less</span>
            {LEVEL_CLASS.map((cls, i) => (
              <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
