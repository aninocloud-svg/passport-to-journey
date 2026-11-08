import type { VisaRoute } from "./types";

// ILLUSTRATIVE curated routes. These are NOT verified data: they exist to demo the UI.
// Fees, stays and processing times are deliberately left null ("Not verified yet").
// Each links to the destination's official authority so users can check themselves.

const base = {
  residence: null,
  fee: null,
  currency: null,
  processing: null,
  source_type: "curated_demo" as const,
  checked_at: null,
  review_after: null,
  confidence: "illustrative" as const,
  illustrative: true,
};

function docs(id: string, labels: string[]) {
  return labels.map((label, i) => ({ id: `${id}-d${i}`, route_id: id, label, required: true }));
}

export const SAMPLE_ROUTES: VisaRoute[] = [
  {
    ...base,
    id: "us-gb-tourism",
    nationality: "US",
    destination: "GB",
    purpose: "tourism",
    visa_type: "Electronic Travel Authorisation (ETA) — illustrative",
    eligibility: "simplified",
    stay_days: null,
    official_apply_url: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta",
    source_url: "https://www.gov.uk/check-uk-visa",
    conditions: ["Confirm current ETA requirement on GOV.UK before travel."],
    documents: docs("us-gb-tourism", ["Valid passport", "Approved ETA linked to passport"]),
    sources: [{ id: "s1", title: "GOV.UK — Check if you need a UK visa", source_url: "https://www.gov.uk/check-uk-visa", source_type: "official_government", checked_at: null }],
  },
  {
    ...base,
    id: "in-jp-tourism",
    nationality: "IN",
    destination: "JP",
    purpose: "tourism",
    visa_type: "Temporary Visitor visa / eVISA — illustrative",
    eligibility: "visa_required",
    stay_days: null,
    official_apply_url: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    source_url: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    conditions: [],
    documents: docs("in-jp-tourism", ["Valid passport", "Visa application form", "Photo", "Itinerary"]),
    sources: [{ id: "s2", title: "Ministry of Foreign Affairs of Japan — Visa", source_url: "https://www.mofa.go.jp/j_info/visit/visa/index.html", source_type: "official_government", checked_at: null }],
  },
  {
    ...base,
    id: "de-us-tourism",
    nationality: "DE",
    destination: "US",
    purpose: "tourism",
    visa_type: "Visa Waiver Program (ESTA) — illustrative",
    eligibility: "simplified",
    stay_days: null,
    official_apply_url: "https://esta.cbp.dhs.gov/",
    source_url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html",
    conditions: ["Eligibility can be affected by prior travel history."],
    documents: docs("de-us-tourism", ["E-passport", "Approved ESTA"]),
    sources: [{ id: "s3", title: "U.S. Department of State — Visa Waiver Program", source_url: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html", source_type: "official_government", checked_at: null }],
  },
  {
    ...base,
    id: "br-pt-tourism",
    nationality: "BR",
    destination: "PT",
    purpose: "tourism",
    visa_type: "Schengen short stay — illustrative",
    eligibility: "conditional",
    stay_days: null,
    official_apply_url: "https://vistos.mne.gov.pt/en/",
    source_url: "https://vistos.mne.gov.pt/en/",
    conditions: ["ETIAS rollout may change requirements — check official sources."],
    documents: docs("br-pt-tourism", ["Valid passport", "Proof of funds", "Return ticket"]),
    sources: [{ id: "s4", title: "Portugal MNE — Visas portal", source_url: "https://vistos.mne.gov.pt/en/", source_type: "official_government", checked_at: null }],
  },
];

/** General official directories used when no route data exists. */
export const OFFICIAL_DIRECTORIES = [
  { label: "IATA Travel Centre (Timatic-based)", url: "https://www.iatatravelcentre.com/" },
  { label: "Your destination's embassy or consulate", url: "https://www.embassypages.com/" },
];
