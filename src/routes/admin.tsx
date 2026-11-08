import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteNav } from "@/components/visa/SiteChrome";
import { SAMPLE_ROUTES } from "@/lib/visa/sample-data";
import { assess, isStale, show } from "@/lib/visa/status";
import { providerStatus } from "@/lib/visa/visa.functions";
import { countryName } from "@/lib/countries";
import type { VisaRoute } from "@/lib/visa/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Source data (demo) — VisaPath" },
      { name: "description", content: "Demo-only view of route records, sources, review dates and provider configuration." },
      { property: "og:title", content: "Source data management (demo) — VisaPath" },
      { property: "og:description", content: "Demo-only admin for visa route sources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const status = useQuery({ queryKey: ["provider-status"], queryFn: () => providerStatus() });
  const [rows, setRows] = useState<VisaRoute[]>(SAMPLE_ROUTES);

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p role="note" className="rounded-lg border border-warn bg-warn-soft p-4 text-sm font-medium text-warn">
          DEMO ONLY — no sign-in is enabled, so edits stay in this browser tab and are never saved. Enable authentication before using this for real source management.
        </p>
        <h1 className="mt-6 text-4xl">Source data</h1>

        <h2 className="mt-8 text-2xl">Providers</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {status.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {status.data?.providers.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{p.name}</p>
              <p className={`text-sm ${p.configured ? "text-ok" : "text-muted-foreground"}`}>{p.configured ? "Key configured" : "Not configured"}</p>
            </div>
          ))}
        </div>
        {status.data && <p className="mt-2 text-sm text-muted-foreground">Active: {status.data.active.name}</p>}

        <h2 className="mt-10 text-2xl">Routes</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Route</th><th className="p-3">Eligibility</th><th className="p-3">Confidence</th><th className="p-3">Checked</th><th className="p-3">Review after</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const a = assess(r);
                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{countryName(r.nationality)} → {countryName(r.destination)} <span className="text-muted-foreground">({r.purpose})</span></td>
                    <td className="p-3">{r.eligibility}</td>
                    <td className="p-3">{r.confidence}</td>
                    <td className="p-3">
                      <label className="sr-only" htmlFor={`c-${r.id}`}>Checked date</label>
                      <input id={`c-${r.id}`} type="date" className="field py-1" value={r.checked_at ?? ""} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, checked_at: e.target.value || null } : x)))} />
                    </td>
                    <td className="p-3">{show(r.review_after)}{isStale(r) && <span className="ml-1 text-warn">(stale)</span>}</td>
                    <td className="p-3 font-semibold capitalize">{a.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
