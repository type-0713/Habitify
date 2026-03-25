import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Compass, Home, SearchSlash } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#09111f_0%,#0f1a2d_34%,#172554_68%,#052e2b_100%)] text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-sky-400/16 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="section-reveal">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200 shadow-[0_20px_60px_-35px_rgba(16,185,129,0.55)] backdrop-blur-xl">
              <Image src="/icon.png" alt="Habitify" width={22} height={22} className="rounded-md" />
              Habitify Recovery
            </div>

            <div className="mt-8 max-w-3xl">
              <p
                className="text-[5.25rem] font-bold leading-none text-white/12 sm:text-[7rem]"
                style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}
              >
                404
              </p>
              <h1
                className="mt-3 text-4xl font-bold leading-tight text-white sm:text-6xl"
                style={{ fontFamily: "'Fraunces', 'Space Grotesk', serif" }}
              >
                This page broke the streak.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                The route you requested does not exist, was removed, or the link is stale. The rest of the app is intact.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#10b981_0%,#0ea5e9_56%,#2563eb_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_24px_55px_-28px_rgba(14,165,233,0.65)] transition hover:-translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                Back To Dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/8 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur-xl transition hover:border-emerald-300/35 hover:bg-white/12"
              >
                <ArrowLeft className="h-4 w-4" />
                Open Safe Route
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="spotlight-card rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-xl section-reveal section-delay-1">
                <SearchSlash className="h-5 w-5 text-rose-200" />
                <p className="mt-4 text-sm font-semibold text-white">Missing route</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">The address does not map to an active page in this build.</p>
              </div>
              <div className="spotlight-card rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-xl section-reveal section-delay-2">
                <Compass className="h-5 w-5 text-sky-200" />
                <p className="mt-4 text-sm font-semibold text-white">Reliable fallback</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Return to the dashboard and continue from the main app entry point.</p>
              </div>
              <div className="spotlight-card rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-xl section-reveal section-delay-3">
                <Home className="h-5 w-5 text-emerald-200" />
                <p className="mt-4 text-sm font-semibold text-white">State preserved</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Your auth and stored habit data are not affected by this missing page.</p>
              </div>
            </div>
          </div>

          <aside className="section-reveal section-delay-2">
            <div className="spotlight-card rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.06)_100%)] p-6 shadow-[0_30px_100px_-50px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Route Status</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Unavailable</p>
                </div>
                <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100">
                  404
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Likely Causes</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                    <li>Typo in the URL</li>
                    <li>Removed or renamed route</li>
                    <li>Old bookmark or external stale link</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recommended Action</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Use the dashboard route and navigate again from inside the app so the path stays consistent with the current build.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
