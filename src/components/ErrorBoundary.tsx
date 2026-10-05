import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
          <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              App startup error
            </p>
            <h1 className="text-3xl font-bold">The app did not load correctly.</h1>
            <p className="mt-4 text-slate-300">
              A runtime error stopped the page from rendering. Refresh the page to retry.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
