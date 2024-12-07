"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const uuid_1 = require("uuid");
/**
 * Creates a formatted payload for WebSocket communication based on agent type
 */
const createPayload = (payload) => {
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
            const _exhaustiveCheck = payload;
            return {};
        }
    }
};
/**
 * Establishes a WebSocket connection and streams chat responses from AI agents
 *
 * @param config - Configuration object containing connection details
 * @throws {Error} When WebSocket connection fails
 */
async function streamChatResponse({ userId, query, baseUrl, apiKey, }) {
    const wsUrl = `wss://${baseUrl}/chat/v2/ws/${userId}?X-FRIDAY-KEY=${apiKey}`;
    const websocket = new ws_1.default(wsUrl);
    websocket.on("open", () => {
        const proAgentPayload = createPayload({
            stream: true,
            agent: "ProAgent",
            contextDuration: 1,
            parentId: (0, uuid_1.v4)(),
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
    websocket.on("message", (data) => {
        try {
            const response = JSON.parse(data.toString());
            console.log("Received response:", response);
        }
        catch (error) {
            console.error("Failed to parse WebSocket message:", error);
        }
    });
    websocket.on("error", (error) => {
        console.error("WebSocket error:", error.message);
    });
    websocket.on("close", (code, reason) => {
        console.log(`WebSocket connection closed - Code: ${code}, Reason: ${reason.toString()}`);
    });
    // Cleanup connection after 5 minutes
    setTimeout(() => {
        if (websocket.readyState === ws_1.default.OPEN) {
            websocket.close();
        }
    }, 5 * 60 * 1000);
}
if (require.main === module) {
    const config = {
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
