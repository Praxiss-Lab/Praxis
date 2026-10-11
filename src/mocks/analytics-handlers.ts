import { http, HttpResponse } from "msw";

// Mock analytics traffic for every PostHog region, path and request method.
export const ANALYTICS_HANDLERS = [
  http.all(/^https:\/\/(?:[\w-]+\.)*posthog\.com(?:\/|$)/, () =>
    HttpResponse.json({}),
  ),
  http.all("https://z.openhands.dev/*", () => HttpResponse.json({})),
];
