"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTime = void 0;
const ws_1 = __importDefault(require("ws"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const getUserTime = () => {
    // Extend dayjs with plugins
    dayjs_1.default.extend(utc_1.default);
    dayjs_1.default.extend(timezone_1.default);
    // Detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Get current timestamp (in UTC)
    const currentTimestamp = Date.now();
    // Parse the timestamp to the detected timezone
    const userTime = (0, dayjs_1.default)(currentTimestamp).tz(userTimezone);
    return userTime;
};
exports.getUserTime = getUserTime;
/**
 * Creates a formatted payload for WebSocket communication based on agent type
 */
const createPayload = (payload) => {
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
async function streamChatResponse({ userId, query, baseUrl, apiKey, agent, }) {
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
    const websocket = new ws_1.default(wsUrl);
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
}
if (require.main === module) {
    const config = {
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
