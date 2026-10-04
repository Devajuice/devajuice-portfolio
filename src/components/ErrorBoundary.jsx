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

    return (
      <div role="alert" className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-text-primary">
          <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          Something went wrong
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          This section could not be displayed. The rest of the page still works.
        </p>
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
