import SmoothAccordion from './ui/SmoothAccordion';
import WorldClockToy from './playground/WorldClockToy';
import SequencerToy from './playground/SequencerToy';
import RandomToys from './playground/RandomToys';

/**
 * A grab-bag page for self-contained toys. Everything here is local-only: no
 * requests, no accounts, nothing persisted beyond the clock's city list.
 *
 * An accordion rather than three stacked panels because the toys are tall and
 * mutually independent — opening one shouldn't imply you have to scroll past the
 * others to reach the next.
 */

export default function PlaygroundSection() {
  const items = [
    {
      id: 'clock',
      title: 'World clock',
      subtitle: 'Up to five cities · saved locally',
      content: (
        <>
          <p className="mb-5">
            The same split-flap clock from the footer, but with the city editor switched on. Pick
            any five and they stick around next visit.
          </p>
          <WorldClockToy />
        </>
      ),
    },
    {
      id: 'sequencer',
      title: 'Step sequencer',
      subtitle: '16 steps · 4 voices',
      content: (
        <>
          <p className="mb-5">
            A four-voice drum machine built on the same Web Audio graph as the site soundtrack.
            Toggle steps, change tempo, or randomize.
          </p>
          <SequencerToy />
        </>
      ),
    },
    {
      id: 'random',
      title: 'Random toys',
      subtitle: 'Dice, coins, ideas, decisions',
      content: (
        <>
          <p className="mb-5">
            Small useless machines. They resolve entirely in the browser and remember nothing.
          </p>
          <RandomToys />
        </>
      ),
    },
  ];

  return (
    <>
      <h2 id="playground-heading" className="section-heading">
        <i className="fas fa-flask" aria-hidden="true" />
        <span>Playground</span>
      </h2>

      <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-text-muted">
        Odds and ends that don&apos;t belong anywhere else. All of it runs locally — no tracking, no
        accounts, no network calls.
      </p>

      <SmoothAccordion items={items} defaultOpen={['clock']} />
    </>
  );
}