import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort fallback.
 *
 * On a device there is no console to open, so an unhandled render error would
 * otherwise leave a blank screen with no way back. This keeps the app's own
 * styling and offers a reload.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept for a future crash reporter; deliberately not logged to the console.
    void error;
    void info;
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 p-6">
        <div
          role="alert"
          className="w-full max-w-md rounded-2xl border border-cream-300 bg-white p-6 text-center shadow-card"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-charcoal-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-500">
            Atronz Pet Social hit an unexpected error and could not finish
            loading this screen. Nothing you posted or saved has been affected.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-clay-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-clay-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reload
          </button>
        </div>
      </div>
    );
  }
}
