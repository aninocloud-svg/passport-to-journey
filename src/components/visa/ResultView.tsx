import { CheckCircle2, AlertTriangle, XCircle, ExternalLink, FileText, Info } from "lucide-react";
import type { LookupResult, Status } from "@/lib/visa/types";
import { show } from "@/lib/visa/status";
import { countryName } from "@/lib/countries";

const STATUS: Record<Status, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  green: { label: "Likely eligible — verified", cls: "bg-ok-soft text-ok border-ok", Icon: CheckCircle2 },
  amber: { label: "Unconfirmed — check official source", cls: "bg-warn-soft text-warn border-warn", Icon: AlertTriangle },
  red: { label: "Visa required / not eligible — verified", cls: "bg-bad-soft text-bad border-bad", Icon: XCircle },
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

export function ResultView({ result }: { result: LookupResult }) {
  const { route, assessment, input, provider } = result;
  const s = STATUS[assessment.status];
  return (
    <section aria-live="polite" className="rounded-2xl border bg-card p-6 shadow-card md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {countryName(input.nationality)} passport · living in {countryName(input.residence)} → {countryName(input.destination)}
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl">{show(route?.visa_type)}</h2>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${s.cls}`} role="status">
          <s.Icon className="h-4 w-4" aria-hidden /> {s.label}
        </div>
      </div>

      {route?.illustrative && (
        <p className="mt-4 inline-block rounded bg-warn-soft px-2 py-1 text-xs font-bold uppercase tracking-widest text-warn">
          Illustrative sample — not verified
        </p>
      )}

      <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
        {assessment.reasons.map((r) => <li key={r}>• {r}</li>)}
      </ul>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Permitted stay" value={show(route?.stay_days, (d) => `${d} days`)} />
        <Field label="Fee" value={route?.fee != null && route.currency ? `${route.fee} ${route.currency}` : show(null)} />
        <Field label="Processing time" value={show(route?.processing)} />
        <Field label="Last checked" value={show(route?.checked_at)} />
      </dl>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-xl"><FileText className="h-5 w-5 text-primary" aria-hidden /> Documents checklist</h3>
          {route?.documents.length ? (
            <ul className="mt-3 space-y-2">
              {route.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" id={d.id} className="h-4 w-4 accent-primary" />
                  <label htmlFor={d.id}>{d.label}</label>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-muted-foreground">Not verified yet</p>}
          {route?.conditions.length ? (
            <>
              <h4 className="mt-5 text-sm font-semibold">Conditions</h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">{route.conditions.map((c) => <li key={c}>{c}</li>)}</ul>
            </>
          ) : null}
        </div>
        <div>
          <h3 className="text-xl">Official sources</h3>
          <ul className="mt-3 space-y-2">
            {result.officialLinks.map((l) => (
              <li key={l.url}><a className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a></li>
            ))}
            {route?.sources.map((src) => (
              <li key={src.id} className="text-sm">
                <a className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline" href={src.source_url} target="_blank" rel="noopener noreferrer">{src.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden /></a>
                <span className="block text-xs text-muted-foreground">Checked: {show(src.checked_at)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Data source: {provider.name}{provider.live ? " (live)" : " — no live provider configured"}</p>
        </div>
      </div>

      <p className="mt-8 flex gap-2 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
        <Info className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden />
        Informational only. The destination's immigration authority makes the final decision on entry. Always confirm with official sources before travel.
      </p>
    </section>
  );
}
