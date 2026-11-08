import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LookupResult } from "./types";
import { assess } from "./status";
import { OFFICIAL_DIRECTORIES } from "./sample-data";

const schema = z.object({
  nationality: z.string().length(2),
  residence: z.string().length(2),
  destination: z.string().length(2),
  purpose: z.enum(["tourism", "business", "transit", "study", "work", "family"]),
  arrival: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.number().int().min(1).max(3650),
});

export const lookupVisa = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<LookupResult> => {
    const { activeProvider, curatedProvider } = await import("./providers.server");
    let provider = activeProvider();
    let route = null;
    try {
      route = await provider.lookup(data);
    } catch (e) {
      console.error("provider failed", e);
      provider = curatedProvider;
      route = await provider.lookup(data);
    }
    const links = [...OFFICIAL_DIRECTORIES];
    if (route?.official_apply_url) links.unshift({ label: "Official application page", url: route.official_apply_url });
    return {
      input: data,
      route,
      assessment: assess(route, data),
      provider: { id: provider.id, name: provider.name, live: provider.live },
      officialLinks: links,
    };
  });

export const providerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { PROVIDERS, activeProvider } = await import("./providers.server");
  const active = activeProvider();
  return {
    active: { id: active.id, name: active.name, live: active.live },
    providers: PROVIDERS.map((p) => ({ id: p.id, name: p.name, configured: p.isConfigured() })),
  };
});
