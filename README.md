# VisaPath

Visa eligibility discovery. Users enter passport nationality, residence, destination, purpose, arrival date and duration and get a likely visa category with a green/amber/red status, documents checklist, official links, source citations and last-checked date.

**Informational only.** The destination's immigration authority makes the final decision. VisaPath never collects passport numbers, scans, cards or other sensitive documents.

## Status rules (`src/lib/visa/status.ts`)
- **Green** — verified, non-stale source says visa-free or simplified (eTA/e-visa/VoA), stay is known and covers the trip, no open conditions.
- **Red** — verified, non-stale source explicitly says visa required or ineligible.
- **Amber** — everything else: no data, conditional, stale (`review_after` passed or never checked), unverified or illustrative.
- Unknown fields render **"Not verified yet"**. Nothing is guessed; no global fees are invented.

Tests: `bunx vitest run src/lib/visa`

## Data model (`src/lib/visa/types.ts`)
`countries`, `visa_routes` (nationality, residence, destination, purpose, visa_type, eligibility, stay, fee, currency, processing, official_apply_url, source_url, source_type, checked_at, review_after, confidence, conditions), `route_documents`, `sources`. Countries come from the maintained `world-countries` ISO 3166-1 dataset (includes territories).

Curated sample routes in `sample-data.ts` are **ILLUSTRATIVE** and not verified. Coverage is partial — not all combinations are covered.

## Live providers (`src/lib/visa/providers.server.ts`)
Server-only adapters; keys are read from secrets at request time and never sent to the browser. No scraping — only licensed APIs.

| Provider | Secrets | Notes |
|---|---|---|
| IATA Timatic | `TIMATIC_API_KEY`, `TIMATIC_BASE_URL` | Authoritative commercial benchmark used by airlines |
| PassportBase | `PASSPORTBASE_API_KEY`, `PASSPORTBASE_BASE_URL` | 199 passports × 198 destinations, official source URLs, fees, check dates |
| Visamundi | `VISAMUNDI_API_KEY`, `VISAMUNDI_BASE_URL` | 249 countries, requirements by nationality/destination |

Optional `VISA_PROVIDER` picks one when several are configured. Add secrets in Project Settings → Secrets. Before going live, adapt each provider's `buildUrl`/`map` to its documented API contract; mapping copies only fields the provider returns, so missing data stays "Not verified yet". With no key, curated demo data is shown with explicit unknown state plus official links. If a provider fails, the app falls back to curated data.

## Admin
`/admin` is **demo-only**: no auth, edits are in-memory. Enable authentication and a database before using it for real source management.
