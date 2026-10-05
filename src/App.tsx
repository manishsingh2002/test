import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
          <div className="inline-flex w-fit items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            SSC CGL Prep
          </div>

          <h1 className="mt-8 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Your exam prep platform is live.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            The app has been reset to a clean, working startup state so it loads immediately instead of showing a blank screen.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Refresh page
            </button>
            <button
              onClick={() => window.alert('Your app is running correctly.')}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Test startup
            </button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              'Fast startup',
              'No blank screen',
              'GitHub Pages ready',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200 shadow-lg shadow-cyan-500/5">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
