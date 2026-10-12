import {
  pollForToken as sdkPollForToken,
  startDeviceFlow as sdkStartDeviceFlow,
} from "@openhands/typescript-client/client/device-flow-client";
import type {
  DeviceAuthorizationResponse,
  DeviceTokenResponse,
  PollDeviceTokenOptions,
} from "@openhands/typescript-client/client/device-flow-client";
import { AGENT_CANVAS_CLIENT_HEADERS } from "./client-source";
import { assertSelfHostedEndpoint } from "./cloud-endpoint-policy";

export {
  DeviceFlowError,
  isOpenHandsCloudHost,
} from "@openhands/typescript-client/client/device-flow-client";

export async function startDeviceFlow(
  host: string,
): Promise<DeviceAuthorizationResponse> {
  assertSelfHostedEndpoint(host);
  const response = await sdkStartDeviceFlow(host, {
    headers: AGENT_CANVAS_CLIENT_HEADERS,
  });
  assertSelfHostedEndpoint(response.verification_uri);
  assertSelfHostedEndpoint(response.verification_uri_complete);
  return response;
}

export async function pollForToken(
  host: string,
  deviceCode: string,
  options: PollDeviceTokenOptions,
): Promise<DeviceTokenResponse> {
  assertSelfHostedEndpoint(host);
  return sdkPollForToken(host, deviceCode, {
    ...options,
    headers: AGENT_CANVAS_CLIENT_HEADERS,
  });
}

export type {
  DeviceAuthorizationResponse,
  DeviceTokenResponse,
  PollDeviceTokenOptions as PollOptions,
} from "@openhands/typescript-client/client/device-flow-client";
