const HOSTED_DOMAINS = ["all-hands.dev", "openhands.dev"];

export function isHostedCloudEndpoint(value: string): boolean {
  const url = new URL(
    value,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  return HOSTED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

export function assertSelfHostedEndpoint(value: string): void {
  if (isHostedCloudEndpoint(value)) {
    throw new Error(
      "OpenHands Cloud is not supported. Configure your own Praxis backend.",
    );
  }
}
