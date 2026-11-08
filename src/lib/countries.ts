import worldCountries from "world-countries";
import type { Country } from "./visa/types";

// Maintained ISO 3166-1 dataset (mledoze/countries) — includes territories.
export const COUNTRIES: Country[] = worldCountries
  .map((c) => ({
    code: c.cca2,
    name: c.name.common,
    region: c.region || "Other",
    flag: c.flag,
    independent: !!c.independent,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
export const countryByCode = (code: string | null | undefined) => (code ? byCode.get(code) : undefined);
export const countryName = (code: string | null | undefined) => countryByCode(code)?.name ?? code ?? "—";
