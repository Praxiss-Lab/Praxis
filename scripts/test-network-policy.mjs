/** Keep unit-test workers and their Node children off external networks. */
import net from "node:net";
import http from "node:http";
import https from "node:https";
import { fileURLToPath } from "node:url";

const preload = `--import=${JSON.stringify(fileURLToPath(import.meta.url))}`;
if (!(process.env.NODE_OPTIONS ?? "").includes("test-network-policy.mjs")) {
  process.env.NODE_OPTIONS =
    `${process.env.NODE_OPTIONS ?? ""} ${preload}`.trim();
}

const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0];
  const options = first && typeof first === "object" ? first : {};
  const localPipe =
    options.path || (typeof first === "string" && !/^\d+$/.test(first));
  const host =
    options.host ?? (typeof args[1] === "string" ? args[1] : "localhost");
  const loopback =
    host === "localhost" ||
    host === "::1" ||
    (/^127(?:\.\d{1,3}){3}$/.test(host) &&
      host.split(".").every((part) => Number(part) <= 255));
  if (!localPipe && !loopback) {
    throw new Error(
      "External socket connections are disabled during unit tests; add a request mock.",
    );
  }
  return connect.apply(this, args);
};

function assertLocalUrl(value) {
  const url = value instanceof URL ? value : new URL(String(value));
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error(
      "External HTTP requests are disabled during unit tests; add a request mock.",
    );
  }
}

// MSW captures these wrappers as its passthrough implementation. Matched mock
// responses still work; unmatched fetch/XHR calls cannot reach a local proxy.
const nativeFetch = globalThis.fetch;
globalThis.fetch = (...args) => {
  const request = args[0];
  assertLocalUrl(
    typeof request === "object" && "url" in request ? request.url : request,
  );
  return nativeFetch(...args);
};
for (const transport of [http, https]) {
  const request = transport.request;
  transport.request = function (...args) {
    const first = args[0];
    if (first instanceof URL || typeof first === "string") {
      assertLocalUrl(first);
    } else if (!first.socketPath) {
      const host = first.hostname ?? first.host ?? "localhost";
      assertLocalUrl(`http://${host}`);
      if (/^https?:\/\//.test(first.path ?? "")) assertLocalUrl(first.path);
      if (first.method === "CONNECT") assertLocalUrl(`https://${first.path}`);
    }
    return request.apply(this, args);
  };
}
