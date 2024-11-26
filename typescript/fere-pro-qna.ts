import WebSocket from 'ws'; // Use 'ws' library for WebSocket in Node.js
import { v4 as uuidv4 } from 'uuid'; // Use 'uuid' library for UUID

async function streamChatResponse(userId: string, query: string, baseUrl: string, apiKey: string): Promise<void> {
  /**
   * Opens a WebSocket connection to send a chat query and stream the response.
   *
   * Args:
   *    userId (string): The user ID for the chat session (UUID string).
   *    query (string): The query string to send.
   *    baseUrl (string): The base URL for the WebSocket endpoint.
   *    apiKey (string): The API key for authentication.
   */

  // Construct the WebSocket URL
  const wsUrl = `wss://${baseUrl}/chat/v2/ws/${userId}?X-FRIDAY-KEY=${apiKey}`;

  // Create a new WebSocket instance
  const websocket = new WebSocket(wsUrl);

  websocket.on('open', () => {
    // Prepare the message payload
    const message = {
      message: query,
      stream: true,
      agent: "ProAgent"
    };

    // Send the message to the WebSocket
    websocket.send(JSON.stringify(message));
    console.log("Message sent to WebSocket.");
  });

  websocket.on('message', (data: WebSocket.Data) => {
    // Log each message received
    console.log(`Streaming response: ${data.toString()}`);
  });

  websocket.on('error', (error: Error) => {
    console.error(`An error occurred: ${error.message}`);
  });

  websocket.on('close', (code: number, reason: Buffer) => {
    console.log(`WebSocket connection closed with code: ${code}, reason: ${reason.toString()}`);
  });
}

// Example usage
(async () => {
  const userId = "YOUR_USER_ID"; // Replace with actual user ID
  const query = "Who are the top KOLs for $CHILLGUY?";
  const baseUrl = "api.fereai.xyz"; // Replace with actual base URL
  const apiKey = "your-api-key"; // Replace with actual API key

  await streamChatResponse(userId, query, baseUrl, apiKey);
})();
