import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import hero from "@/assets/hero-landscape.jpg";
import { SiteNav } from "@/components/visa/SiteChrome";
import { CountrySelect } from "@/components/visa/CountrySelect";
import { ResultView } from "@/components/visa/ResultView";
import { lookupVisa } from "@/lib/visa/visa.functions";
import { PURPOSES, type LookupResult, type Purpose, type SearchInput } from "@/lib/visa/types";
import { SAMPLE_ROUTES } from "@/lib/visa/sample-data";
import { countryByCode } from "@/lib/countries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisaPath — Check visa eligibility before you travel" },
      { name: "description", content: "Discover likely visa requirements by passport, residence and destination, with official sources and verification dates." },
      { property: "og:title", content: "VisaPath — Visa eligibility discovery" },
      { property: "og:description", content: "Likely visa category, documents and official links — never guessed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const in30 = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

function Index() {
  const lookup = useServerFn(lookupVisa);
  const [form, setForm] = useState<SearchInput>({ nationality: "US", residence: "US", destination: "GB", purpose: "tourism", arrival: in30(), duration: 10 });
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function run(input: SearchInput) {
    setLoading(true); setError(null);
    try {
      setResult(await lookup({ data: input }));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setError("We couldn't complete the check. Please review your inputs and try again.");
    } finally { setLoading(false); }
  }
  const set = <K extends keyof SearchInput>(k: K, v: SearchInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <main>
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <img src={hero} alt="Mountain road winding beside an alpine lake at sunrise" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <SiteNav overlay />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-32 text-hero-foreground">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-90">Visa eligibility, sourced</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.05] md:text-7xl">Know the path <em className="font-light">before</em> you pack.</h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">Likely visa category, documents and official links for your trip — with every source cited and nothing guessed.</p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); run(form); }}
          className="grid gap-4 rounded-2xl border bg-card p-6 shadow-card md:grid-cols-3"
          aria-label="Visa eligibility search"
        >
          <CountrySelect label="Passport nationality" value={form.nationality} onChange={(v) => set("nationality", v)} />
          <CountrySelect label="Country of residence" value={form.residence} onChange={(v) => set("residence", v)} />
          <CountrySelect label="Destination" value={form.destination} onChange={(v) => set("destination", v)} />
          <div>
            <label htmlFor="purpose" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Travel purpose</label>
            <select id="purpose" className="field" value={form.purpose} onChange={(e) => set("purpose", e.target.value as Purpose)}>
              {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="arrival" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arrival date</label>
            <input id="arrival" type="date" className="field" value={form.arrival} onChange={(e) => set("arrival", e.target.value)} required />
          </div>
          <div>
            <label htmlFor="duration" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trip duration (days)</label>
            <input id="duration" type="number" min={1} max={3650} className="field" value={form.duration} onChange={(e) => set("duration", Number(e.target.value) || 1)} required />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-3">
            <p className="text-xs text-muted-foreground">We never ask for passport numbers, scans or payment details.</p>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
              Check eligibility
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-bad md:col-span-3">{error}</p>}
        </form>
      </section>

      <div ref={resultRef} className="mx-auto max-w-6xl scroll-mt-6 px-4 py-12">
        {result && <ResultView result={result} />}
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-warn">Illustrative</p>
            <h2 className="mt-1 text-3xl md:text-4xl">Sample searches</h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">Demo routes to explore the experience. They are not verified data.</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_ROUTES.map((r) => {
            const a = countryByCode(r.nationality), b = countryByCode(r.destination);
            return (
              <button
                key={r.id}
                onClick={() => { const i = { ...form, nationality: r.nationality, residence: r.nationality, destination: r.destination, purpose: r.purpose }; setForm(i); run(i); }}
                className="group rounded-2xl border bg-card p-5 text-left transition hover:-translate-y-1 hover:shadow-card"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-warn">Illustrative</span>
                <p className="mt-3 text-3xl" aria-hidden>{a?.flag} → {b?.flag}</p>
                <p className="mt-2 font-display text-lg">{a?.name} to {b?.name}</p>
                <p className="text-sm capitalize text-muted-foreground">{r.purpose}</p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
