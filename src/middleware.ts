import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { robotsHeader } from "@/lib/robots";

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const value = robotsHeader(typeof env.ENVIRONMENT === "string" ? env.ENVIRONMENT : undefined);
  if (value) response.headers.set("X-Robots-Tag", value);
  return response;
});
