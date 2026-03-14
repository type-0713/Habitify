import dynamic from 'next/dynamic';

const HabitClientApp = dynamic(() => import('./habit-client'), { ssr: false });

function MissingClerkConfig() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-3">Clerk configuration missing</h1>
        <p className="text-sm text-slate-300 mb-6">
          Set <span className="font-semibold">{'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'}</span> and
          <span className="font-semibold">{' CLERK_SECRET_KEY'}</span> in your Vercel project environment variables,
          then redeploy.
        </p>
        <div className="text-xs text-slate-400">
          This message is shown to prevent a 500 error when auth keys are not configured.
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <MissingClerkConfig />;
  }
  return <HabitClientApp />;
}
