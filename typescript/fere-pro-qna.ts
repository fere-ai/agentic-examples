import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

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
    stream: payload.stream ?? false,
    agent: payload.agent,
    x_hours: payload.contextDuration,
  };

  switch (payload.agent) {
    case "ProAgent": {
      return {
        ...basePayload,
        parent: payload.parentId,
      };
    }
    case "MarketAnalyzerAgent": {
      return {
        ...basePayload,
        parent: "0",
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
}: ChatConfig): Promise<void> {
  const wsUrl = `wss://${baseUrl}/chat/v2/ws/${userId}?X-FRIDAY-KEY=${apiKey}`;
  const websocket = new WebSocket(wsUrl);

  websocket.on("open", () => {
    const proAgentPayload = createPayload({
      stream: true,
      agent: "ProAgent",
      contextDuration: 1,
      parentId: uuidv4(),
      value: query,
    });

    websocket.send(JSON.stringify(proAgentPayload));

    // uncomment to try market analyzer

    // const marketAnalyzerPayload = createPayload({
    //   stream: false,
    //   agent: "MarketAnalyzerAgent",
    //   contextDuration: 1,
    // });

    // websocket.send(JSON.stringify(marketAnalyzerPayload));

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
    userId: "YOUR_USER_ID",
    query: "Who are the top KOLs for $CHILLGUY?",
    baseUrl: "api.fereai.xyz",
    apiKey: "your-api-key",
  };

  streamChatResponse(config).catch((error) => {
    console.error("Failed to stream chat response:", error);
    process.exit(1);
  });
}
