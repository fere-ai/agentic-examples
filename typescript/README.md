# Fere Pro Agent

### Run with Yarn

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

To use this module, ensure you have the necessary dependencies installed. You can install them using `npm` or `yarn`:

```bash
npm install ws dayjs
```

or

```bash
yarn add ws dayjs
```

## Usage

Here is an example of how to use the `streamChatResponse` function:

### ProAgent Example

```typescript
import { streamChatResponse } from "./fere-pro-qna";

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

### MarketAnalyzerAgent Example

```typescript
import { streamChatResponse } from "./fere-pro-qna";

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

Before using the `streamChatResponse` function, configure the following parameters:

- `userId`: Your unique user ID.
- `query`: The question or query you want to send to the AI agent.
- `baseUrl`: The base URL of the API you are connecting to.
- `apiKey`: Your API key for authentication.
- `agent`: The type of agent you want to interact with (`ProAgent` or `MarketAnalyzerAgent`).

## Error Handling

If the WebSocket connection fails or there are issues with the messages being sent or received, appropriate error messages will be logged to the console. Ensure to handle errors gracefully in your application.

---

# Trading Agent APIs

### Run with Yarn

```bash
yarn install
```

### Run Trading Agent

```bash
yarn dev:trading-agent
```

## Usage

Copy the `trading-agent.ts` file to your codebase, add the necessary dependencies, and import `Agent` (the default export) to start using it. Alternatively, if you're using this repository, simply import `Agent` and get started with the following quick-start examples.

### Create FereAgent Instance

```typescript
import FereAgent from "trading-agent-sdk";
import fs from "fs";
import path from "path";

const agent = new FereAgent("YOUR-USER-ID", "YOUR-API-KEY");

const createAgentParams: CreateAgentParams = {
  name: "MyDisciple",
  description: "My first disciple",
  persona: "I am a crypto trader",
  dataSource: "latest",
  decisionPromptPool: "CoinDecision",
  decisionPromptPortfolio: "CoinDecisionPortfolio",
  twitterUsername: "fere_ai",
  fcUsername: "fere_ai",
  simulation: true,
  simulationInitialUsd: 10000,
  maxInvestmentPerSession: 0.1,
  stopLoss: 0.1,
  trailingStopLoss: 0.1,
  takeProfit: 0.1,
};
```

### Create a Disciple Agent

```typescript
const createdAgent = await agent.createAgent(createAgentParams);
if (createdAgent) {
  console.log(`Agent created: ${createdAgent.id}`);

  const { sol_address, evm_address, sol_pvt_key, evm_pvt_key, mnemonic } =
    createdAgent;

  // Save keys and addresses to .env file
  const envContent = [
    `SOLANA_WALLET_ADDRESS=${sol_address}`,
    `EVM_WALLET_ADDRESS=${evm_address}`,
    `SOLANA_PRIVATE_KEY=${sol_pvt_key}`,
    `EVM_PRIVATE_KEY=${evm_pvt_key}`,
    `MNEMONIC=${mnemonic}`,
  ].join("\n");

  const envFilePath = path.join(__dirname, `agent-${createdAgent.id}.env`);

  try {
    fs.writeFileSync(envFilePath, envContent, { mode: 0o600 }); // Set restrictive permissions
    console.log(`Credentials saved to ${envFilePath}`);
  } catch (error) {
    console.error("Failed to save credentials:", error);
  }
} else {
  console.log("Agent creation failed");
}
```

### Fetch Disciples for User

```typescript
console.log(await agent.fetchDisciples());
```

### Get Disciple Details

```typescript
console.log(await agent.getAgentDetails("DISCIPLE-AGENT-ID"));
```

### Get Decisions

```typescript
console.log(await agent.getDecisions("DISCIPLE-AGENT-ID"));
```

### Get Portfolio

```typescript
console.log(await agent.getPortfolio("DISCIPLE-AGENT-ID"));
```

### Get Holdings

```typescript
console.log(await agent.getHoldings("DISCIPLE-AGENT-ID"));
```

### Get Optimal Gains

```typescript
console.log(await agent.getOptimalGains("YOUR-DISCIPLE-ID"));
```

### Get Trades

```typescript
console.log(await agent.getTrades("YOUR-DISCIPLE-ID"));
```

### Create Trade (Sell a Holding Manually)
When you submit a trade to sell a holding, you will receive a task ID in the response. You can use this task ID to check the status of the trade using the task status endpoint.

```typescript
console.log(await agent.sellHolding("YOUR-DISCIPLE-ID", "HOLDING-ID", 10));
```

### Get Status of Task

```typescript
console.log(await agent.getTaskStatus("TASK-ID"));
```

### Update Agent

```typescript
console.log(
  await agent.updateAgent("YOUR-DISCIPLE-ID", {
    ...createAgentParams,
    name: "MyUpdatedDisciple", // Updated parameters
  })
);
```

### Delete Disciple Agent

```typescript
const deleted = await agent.deleteDisciple("DISCIPLE-AGENT-ID");
if (deleted) {
  console.log("Disciple agent deleted");
} else {
  console.log("Disciple agent deletion failed");
}
```
