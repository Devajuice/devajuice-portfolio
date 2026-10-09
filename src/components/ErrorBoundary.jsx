import React from 'react';

/**
 * Keeps a render failure in one component from unmounting the entire app.
 *
 * Previously a single bad child (e.g. a Framer Motion value rendered as a React
 * child) threw during render and React tore down the whole tree, leaving a blank
 * page with no way to recover. Sections here are independent, so degrade
 * gracefully instead.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught render error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(error, () => this.setState({ error: null }))
        : this.props.fallback;
    }

    const detail = error?.message ? String(error.message) : String(error);

    return (
      <div
        role="alert"
        className="rounded-xl border border-border bg-surface p-6 text-left shadow-subtle"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          Section error
        </div>

        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-text-primary">
          <i className="fas fa-triangle-exclamation text-rose-400" aria-hidden="true" />
          This section failed to render
        </h2>

        <p className="mb-4 text-sm text-text-muted">
          The component below threw while rendering, so it was isolated to keep the rest of the page
          working. Everything else on the site is unaffected.
        </p>

        <details className="mb-4 overflow-hidden rounded-lg border border-border bg-surface-raised">
          <summary className="cursor-pointer list-none px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-text-secondary uppercase select-none hover:text-text-primary">
            What broke
          </summary>
          <pre className="overflow-x-auto border-t border-border px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-text-secondary">
            {detail}
          </pre>
        </details>

        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="focus-ring cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover"
        >
          Try again
        </button>
      </div>
    );
  }
}
