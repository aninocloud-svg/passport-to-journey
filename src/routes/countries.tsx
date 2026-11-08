import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/visa/SiteChrome";
import { COUNTRIES } from "@/lib/countries";
import { SAMPLE_ROUTES } from "@/lib/visa/sample-data";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "Country directory — VisaPath" },
      { name: "description", content: "Browse every ISO country and territory and see where VisaPath has sample route data." },
      { property: "og:title", content: "Country directory — VisaPath" },
      { property: "og:description", content: "All countries and territories with data coverage indicators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Countries,
});

function Countries() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const regions = useMemo(() => ["All", ...Array.from(new Set(COUNTRIES.map((c) => c.region))).sort()], []);
  const withData = useMemo(() => new Set(SAMPLE_ROUTES.map((r) => r.destination)), []);
  const list = COUNTRIES.filter((c) => (region === "All" || c.region === region) && c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl md:text-5xl">Country directory</h1>
        <p className="mt-2 text-muted-foreground">{COUNTRIES.length} countries & territories (ISO 3166-1). Most have no verified route data yet.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="q">Search countries</label>
          <input id="q" className="field sm:max-w-sm" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="sr-only" htmlFor="region">Region</label>
          <select id="region" className="field sm:max-w-48" value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <li key={c.code} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <span className="text-2xl" aria-hidden>{c.flag}</span>
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.code} · {c.region}{c.independent ? "" : " · territory"}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${withData.has(c.code) ? "bg-warn-soft text-warn" : "bg-muted text-muted-foreground"}`}>
                {withData.has(c.code) ? "Illustrative" : "Not verified yet"}
              </span>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="mt-8 text-muted-foreground">No countries match.</p>}
      </main>
    </>
  );
}
