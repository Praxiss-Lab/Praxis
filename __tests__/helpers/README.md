# Praxis WebSocket test helpers

These helpers expose connection and store behavior to React tests and provide MSW WebSocket setup. They do not start a real backend.

## Components

Import from `websocket-test-components.tsx`:

| Export                                | Observed state                                  |
| ------------------------------------- | ----------------------------------------------- |
| `ConnectionStatusComponent`           | WebSocket connection state                      |
| `EventStoreComponent`                 | Event count, UI event count and latest event ID |
| `OptimisticUserMessageStoreComponent` | Pending user messages and their status          |
| `ErrorMessageStoreComponent`          | Current error message                           |

Render the components inside the providers required by the test. The test owns provider construction, event delivery and assertions.

## MSW setup

`msw-websocket-setup.ts` exports:

- `createWebSocketLink(url)`: creates a link; default `ws://localhost/events/socket`.
- `createWebSocketMockServer(wsLink)`: creates an MSW server with the connection handler.
- `createWebSocketTestSetup(url)`: returns `{ wsLink, server }`.
- `conversationWebSocketTestSetup()`: uses `ws://localhost:3000/sockets/session/*`.

For a test located directly under `__tests__/`:

```typescript
import { afterAll, afterEach, beforeAll } from "vitest";
import { conversationWebSocketTestSetup } from "./helpers/msw-websocket-setup";

const { wsLink, server } = conversationWebSocketTestSetup();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Use `wsLink` to register the scenario's handlers. Close client connections and reset the relevant stores as part of test cleanup. Assert event processing and recovery rather than implementation call counts.
