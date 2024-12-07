import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const getUserTime = () => {
  // Extend dayjs with plugins
  dayjs.extend(utc);
  dayjs.extend(timezone);

  // Detect user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get current timestamp (in UTC)
  const currentTimestamp = Date.now();

  // Parse the timestamp to the detected timezone
  const userTime = dayjs(currentTimestamp).tz(userTimezone);

  return userTime;
};

export { getUserTime };

/**
 * Available AI agent endpoints that can be queried
 */
type Endpoint = "ProAgent" | "MarketAnalyzerAgent";

/**
 * Base interface for all agent payloads
 */
interface BaseAgentPayload {
  readonly stream?: boolean;
  readonly agent: Endpoint;
  readonly contextDuration: number;
}

/**
 * ProAgent specific payload interface
 */
interface ProAgentPayload extends BaseAgentPayload {
  readonly agent: "ProAgent";
  readonly value: string;
  readonly parentId: string;
}

/**
 * MarketAnalyzer specific payload interface
 */
interface MarketAnalyzerPayload extends BaseAgentPayload {
  readonly agent: "MarketAnalyzerAgent";
}

type Payload = ProAgentPayload | MarketAnalyzerPayload;

/**
 * Creates a formatted payload for WebSocket communication based on agent type
 */
const createPayload = (payload: Payload): Record<string, unknown> => {
  const basePayload = {
    agent: payload.agent,
    stream: payload.stream ?? false,
    user_time: getUserTime().format(),
    x_hours: payload.contextDuration,
  };

  switch (payload.agent) {
    case "ProAgent": {
      return {
        ...basePayload,
        parent: payload.parentId === "0" ? 0 : payload.parentId,
        message: payload.value,
      };
    }
    case "MarketAnalyzerAgent": {
      return {
        ...basePayload,
        parent: 0,
      };
    }
    default: {
      const _exhaustiveCheck: never = payload;
      return {};
    }
  }
};

interface ChatConfig {
  readonly userId: string;
  readonly query: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly agent: Endpoint;
}

/**
 * Establishes a WebSocket connection and streams chat responses from AI agents
 *
 * @param config - Configuration object containing connection details
 * @throws {Error} When WebSocket connection fails
 */
async function streamChatResponse({
  userId,
  query,
  baseUrl,
  apiKey,
  agent,
}: ChatConfig): Promise<void> {
  const wsUrl = (() => {
    switch (agent) {
      case "ProAgent":
        return `wss://${baseUrl}/chat/v2/ws/${userId}?X-FRIDAY-KEY=${apiKey}`;
      case "MarketAnalyzerAgent":
        return `wss://${baseUrl}/ws/generate_summary/${userId}?X-FRIDAY-KEY=${apiKey}`;
      default:
        throw new Error(`Unsupported agent: ${agent}`);
    }
  })();

  const websocket = new WebSocket(wsUrl);

  websocket.on("open", () => {
    const payload = createPayload({
      stream: true,
      agent,
      contextDuration: 1,
      parentId: agent === "ProAgent" ? (0).toString() : (0).toString(),
      value: query,
    });

    console.log(payload, " agent payload");

    websocket.send(JSON.stringify(payload));

    console.log("Messages sent to WebSocket");
  });

  websocket.on("message", (data: WebSocket.Data) => {
    try {
      const response = JSON.parse(data.toString());
      console.log("Received response:", response);
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  });

  websocket.on("error", (error: Error) => {
    console.error("WebSocket error:", error.message);
  });

  websocket.on("close", (code: number, reason: Buffer) => {
    console.log(
      `WebSocket connection closed - Code: ${code}, Reason: ${reason.toString()}`
    );
  });
}

if (require.main === module) {
  const config: ChatConfig = {
    userId: "YOUR-USER-ID",
    query: "Who are the top KOLs for $CHILLGUY?",
    baseUrl: "api.fereai.xyz",
    apiKey: "YOUR-API-KEY",
    // select agent type
    agent: "ProAgent",
  };

  streamChatResponse(config).catch((error) => {
    console.error("Failed to stream chat response:", error);
    process.exit(1);
  });
}
