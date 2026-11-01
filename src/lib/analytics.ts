const PRODUCTION_HOSTNAME = "printo-kids.printokids.workers.dev";

// Public by design: Cloudflare Web Analytics embeds this token in every page it counts.
const BEACON_TOKEN = "7699341d37474a38b7d4585e3fb50ab8";

export interface WebAnalyticsBeacon {
  src: string;
  data: string;
}

export function webAnalyticsBeacon(hostname: string, environment: string | undefined): WebAnalyticsBeacon | undefined {
  if (hostname !== PRODUCTION_HOSTNAME || environment === "staging") return undefined;
  return {
    src: "https://static.cloudflareinsights.com/beacon.min.js",
    data: JSON.stringify({ token: BEACON_TOKEN }),
  };
}
