import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      {/* Background visuals */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 text-center md:pt-32">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          Live on Cronos Testnet
        </span>
        <h1 className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-7xl animate-gradient-x">
          Work. Space. Earn.
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-white/70 md:text-xl">
          Create your freelance workspace, send beautiful on-chain invoices, and get paid instantly
          in CRO or USDC. Own your earnings. No middlemen.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/create-invoice"
            className="group inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500 active:translate-y-0"
          >
            Create Invoice
            <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
          >
            View Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
          <Stat kpi="0%" label="Platform fees" />
          <Stat kpi="~6s" label="Avg. settle time" />
          <Stat kpi="USDC / CRO" label="Assets supported" />
          <Stat kpi="x402" label="Micropayments" />
        </div>
      </section>

      {/* Features: Workspace & Earning */}
      <section className="relative z-10 mx-auto mt-20 max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Your Freelance Workspace"
            desc="Organize clients, draft invoices, and track status in one clean dashboard."
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-indigo-400" fill="currentColor">
                <path d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            }
          />
          <FeatureCard
            title="Invoice Beautifully"
            desc="Send professional on-chain invoices in CRO or USDC. Share a secure payment link."
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-400" fill="currentColor">
                <path d="M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
              </svg>
            }
          />
          <FeatureCard
            title="Earn Instantly"
            desc="Clients pay with one click. Funds settle on-chain—no waiting, no gatekeepers."
            icon={
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-400" fill="currentColor">
                <path d="M12 8c-2.21 0-4 1.79-4 4H6l3 3 3-3h-2a2 2 0 114-0 1 1 0 100-2z" />
              </svg>
            }
          />
        </div>

        {/* Secondary section */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Micropayments with x402"
            badge="New"
            desc="Verify and settle payments via facilitator, then auto-mark invoices as paid—perfect for recurring or usage-based work."
            cta={{ href: '/pay-invoice/1', label: 'See a sample payment' }}
          />
          <InfoCard
            title="Secure by Design"
            desc="Smart contracts handle payment and status. You keep custody of your earnings in your wallet."
            cta={{ href: '/dashboard', label: 'Open your workspace' }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10/50 bg-black/20 py-8 text-center text-white/50">
        <p className="text-sm">Built for freelancers on Cronos • Chronos Freelancer</p>
      </footer>
    </main>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
      <div className="text-2xl font-bold text-white">{kpi}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-6 backdrop-blur">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl transition group-hover:scale-125" />
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-white/10 p-2">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function InfoCard({
  title,
  desc,
  badge,
  cta,
}: {
  title: string;
  desc: string;
  badge?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {badge ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
        >
          {cta.label}
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}