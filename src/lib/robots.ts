export function robotsHeader(environment: string | undefined): string | undefined {
  return environment === "staging" ? "noindex, nofollow" : undefined;
}
