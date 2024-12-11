# Fere Pro Agent

### Run with yarn

```bash
yarn install
```

### Run Fere Agent

```bash
yarn dev:fere-pro-qna
```

## Overview

The `fere-pro-qna.ts` module provides functionality to interact with AI agents via WebSocket. It allows users to send queries and receive responses in real-time.

## Installation

To use this module, ensure you have the necessary dependencies installed. You can install them using npm or yarn:

```bash
npm install ws dayjs
```
or
```bash
yarn add ws dayjs
```

## Usage

Here is an example of how to use the `streamChatResponse` function:

### ProAgent
```typescript
import { streamChatResponse } from './fere-pro-qna';

const config = {
  userId: "YOUR-USER-ID",
  query: "Who are the top KOLs for $CHILLGUY?",
  baseUrl: "api.fereai.xyz",
  apiKey: "YOUR-API-KEY",
  agent: "ProAgent",
};

streamChatResponse(config).catch((error) => {
  console.error("Failed to stream chat response:", error);
});
```

### MarketAnalyzerAgent
```typescript
import { streamChatResponse } from './fere-pro-qna';

const config = {
  userId: "YOUR-USER-ID",
  baseUrl: "api.fereai.xyz",
  apiKey: "YOUR-API-KEY",
  agent: "MarketAnalyzerAgent",
};

streamChatResponse(config).catch((error) => {
  console.error("Failed to stream chat response:", error);
});
```

## Configuration

Before using the `streamChatResponse` function, you need to configure the following parameters:

- `userId`: Your unique user ID.
- `query`: The question or query you want to send to the AI agent.
- `baseUrl`: The base URL of the API you are connecting to.
- `apiKey`: Your API key for authentication.
- `agent`: The type of agent you want to interact with (`ProAgent` or `MarketAnalyzerAgent`).

## Error Handling

If the WebSocket connection fails or if there are issues with the messages being sent or received, appropriate error messages will be logged to the console. Ensure to handle errors gracefully in your application.

# Trading Agent APIs

### Run with yarn

```bash
yarn install
```

### Run Trading Agent

```bash
yarn dev:trading-agent
```

## Usage 

### Create a Disciple Instance
