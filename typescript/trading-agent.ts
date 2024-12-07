import axios, { AxiosResponse } from "axios";
import * as fs from "fs";
import * as path from "path";

interface CreateAgentParams {
  name: string;
  description: string;
  persona: string;
  dataSource: "latest" | "trending";
  decisionPromptPool: string;
  decisionPromptPortfolio: string;
  twitterUsername?: string;
  fcUsername?: string;
  simulation?: boolean;
  simulationInitialUsd?: number;
  maxInvestmentPerSession?: number;
  stopLoss?: number;
  trailingStopLoss?: number;
  takeProfit?: number;
}

interface CreateAgentResponse extends CreateAgentParams {
  mnemonic: string;
  sol_address: string;
  evm_address: string;
  sol_pvt_key: string;
  evm_pvt_key: string;
}

interface UpdateAgentPayload {
  name: string;
  description: string;
  persona: string;
  dataSource: string;
  decisionPromptPool: string;
  decisionPromptPortfolio: string;
  twitterUsername?: string;
  fcUsername?: string;
  dryRun?: boolean;
  dryRunInitialUsd?: number;
  maxInvestmentPerSession?: number;
  stopLoss?: number;
  trailingStopLoss?: number;
  takeProfit?: number;
}

interface Disciple extends CreateAgentParams {
  is_active: boolean;
}

interface AgentPortfolio {
  id: string; // UUID
  agent_id: string; // UUID
  start_time: string; // ISO 8601 date-time string
  start_usd: number; // Start USD
  start_native: number; // Start Native
  curr_realised_usd: number; // Current Realised USD
  curr_realised_native: number; // Current Realised Native
  curr_unrealised_usd: number; // Current Unrealised USD
  curr_unrealised_native: number; // Current Unrealised Native
  dry_run: boolean; // Dry Run
}

interface AgentHolding {
  id: string; // UUID
  bought_at: string; // ISO 8601 date-time string
  agent_id: string; // UUID
  base_address: string; // Base Address
  pool_address: string; // Pool Address
  pool_name: string; // Pool Name
  token_name: string; // Token Name
  decimals: number; // Decimals (integer)
  tokens_bought: number; // Tokens Bought
  buying_price_usd: number; // Buying Price in USD
  buying_price_native: number; // Buying Price in Native
  curr_price_usd: number; // Current Price in USD
  curr_price_native: number; // Current Price in Native
  profit_abs_usd: number; // Profit Absolute in USD (could specify structure if known)
  profit_abs_native: number; // Profit Absolute in Native (could specify structure if known)
  profit_per_usd: number; // Profit Percentage in USD (could specify structure if known)
  profit_per_native: number; // Profit Percentage in Native (could specify structure if known)
  is_active: boolean; // Is Active
  dry_run: boolean; // Dry Run
}

interface AgentDecisions {
  id: string; // UUID
  agent_id: string; // UUID
  created_at: string; // ISO 8601 date-time string
  pool_address: string; // Pool Address
  decision: number; // Decision (integer)
  price_usd: number; // Price in USD
  price_native: number; // Price in Native
  reason: string; // Reason (could specify structure if known)
  future_action: string; // Future Action (could specify structure if known)
  dry_run: boolean; // Dry Run
}

interface AgentTrades {
  created_at: string; // date-time
  agent_id: string; // uuid
  base_address: string; // Base Address (string)
  pool_name: string; // Pool Name (string)
  decision: number; // Decision (integer)
  price_usd: number; // Price Usd (number)
  price_sol: number; // Price Sol (number)
  in_amount: number; // In Amount (number)
  out_amount: number; // Out Amount (number)
  gas_fee: number; // Gas Fee (number)
  jito_fee: number; // Jito Fee (number)
  other_amount_threshold: number; // Other Amount Threshold (number)
  reason: string;
  future_action: string;
  profit_sol: number;
  profit_usd: number;
  profit_percentage: object;
  txn: string;
  dry_run: boolean; // Dry Run (boolean)
}

class FereAgent {
  private fereApiKey: string;
  private fereUserId: string;
  private baseUrl: string = "https://api.fereai.xyz/ta";

  constructor(fereApiKey: string, fereUserId: string) {
    this.fereApiKey = fereApiKey;
    this.fereUserId = fereUserId;
  }

  private getApiHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-FRIDAY-KEY": this.fereApiKey,
      "X-FERE-USERID": this.fereUserId,
    };
  }

  async createAgent(
    params: CreateAgentParams
  ): Promise<CreateAgentResponse | null> {
    const url = `${this.baseUrl}/agent/`;
    const payload = {
      user_id: this.fereUserId,
      name: params.name,
      description: params.description,
      persona: params.persona,
      data_source: params.dataSource,
      decision_prompt_pool: params.decisionPromptPool,
      decision_prompt_portfolio: params.decisionPromptPortfolio,
      twitter_username: params.twitterUsername,
      fc_username: params.fcUsername,
      dry_run: params.simulation || false,
      dry_run_initial_usd: params.simulationInitialUsd || 0,
      max_investment_per_session: params.maxInvestmentPerSession || 0,
      stop_loss: params.stopLoss || 0.1,
      trailing_stop_loss: params.trailingStopLoss || 0.1,
      take_profit: params.takeProfit || 0.1,
    };

    try {
      const response = await axios.put<CreateAgentResponse>(url, payload, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.error("Request failed:", error);
      return null;
    }
  }

  async fetchDisciples(): Promise<Disciple[]> {
    const url = `${this.baseUrl}/ta/agent/${this.fereUserId}/`;

    try {
      const response: AxiosResponse<Array<Disciple>> = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : [];
    } catch (error) {
      console.error(`Request failed: ${error}`);
      return [];
    }
  }

  async getAgentDetails(discipleAgentId: string): Promise<Disciple | null> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}`;
    try {
      const response: AxiosResponse<Disciple> = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.error(`Request failed: ${error}`);

      return null;
    }
  }

  async getPortfolio(discipleAgentId: string): Promise<AgentPortfolio | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/portfolio/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getHoldings(discipleAgentId: string): Promise<AgentHolding[] | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/holdings/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getTrades(discipleAgentId: string): Promise<AgentTrades[] | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/trades/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getTradeRecommendations(
    discipleAgentId: string
  ): Promise<any[] | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/decisions/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getOptimalGains(discipleAgentId: string): Promise<any | void> {
    const url = `${this.baseUrl}/ta/agent/${discipleAgentId}/buy/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async sellHolding(
    discipleAgentId: string,
    holdingId: string,
    quantity: number
  ): Promise<any | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/sell/f${holdingId}/f${quantity}/`;
    const payload = {};

    try {
      const response: AxiosResponse = await axios.post(url, payload, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getTaskStatus(taskId: string): Promise<any | void> {
    const url = `${this.baseUrl}/task/status/${taskId}/`;
    const payload = {};

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async getDecisions(discipleAgentId: string): Promise<AgentDecisions | null> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/decisions/`;

    try {
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.error(`Request failed: ${error}`);

      return null;
    }
  }

  async updateAgent(
    discipleId: string,
    payload: UpdateAgentPayload
  ): Promise<any | void> {
    const url = `${this.baseUrl}/agent/${discipleId}/`;

    try {
      const response: AxiosResponse = await axios.patch(
        url,
        {
          ...payload,
          user_id: this.fereUserId,
        },
        {
          headers: this.getApiHeaders(),
        }
      );

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }

  async deleteDisciple(discipleAgentId: string): Promise<any | void> {
    const url = `${this.baseUrl}/agent/${discipleAgentId}/`;
    const payload = {};

    try {
      const response: AxiosResponse = await axios.delete(url, {
        headers: this.getApiHeaders(),
        data: payload,
      });

      return response.status === 200 ? response.data : undefined;
    } catch (error) {
      console.error(`Request failed: ${error}`);
    }
  }
}

async function main() {
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

  //   const createdAgent = await agent.createAgent(createAgentParams);
  //   if (createdAgent) {
  //     console.log(`Agent created: ${createdAgent.id}`);

  //     const { sol_address, evm_address, sol_pvt_key, evm_pvt_key, mnemonic } =
  //       createdAgent;

  //     // Save keys and addresses to .env file
  //     const envContent = [
  //       `SOLANA_WALLET_ADDRESS=${sol_address}`,
  //       `EVM_WALLET_ADDRESS=${evm_address}`,
  //       `SOLANA_PRIVATE_KEY=${sol_pvt_key}`,
  //       `EVM_PRIVATE_KEY=${evm_pvt_key}`,
  //       `MNEMONIC=${mnemonic}`,
  //     ].join("\n");

  //     const envFilePath = path.join(__dirname, `agent-${createdAgent.id}.env`);

  //     try {
  //       fs.writeFileSync(envFilePath, envContent, { mode: 0o600 }); // Set restrictive permissions
  //       console.log(`Credentials saved to ${envFilePath}`);
  //     } catch (error) {
  //       console.error("Failed to save credentials:", error);
  //     }
  //   } else {
  //     console.log("Agent creation failed");
  //   }

  // fetch disciples or 0xMonk Agents
  //   console.log(await agent.fetchDisciples());

  // get disciple details
  //   console.log(
  //     await agent.getAgentDetails("DISCIPLE-AGENT-ID")
  //   );

  // delete disciple agent
  //   const deleted = await agent.deleteDisciple("DISCIPLE-AGENT-ID");

  //   if (deleted) {
  //     console.log("Disciple agent deleted");
  //   } else {
  //     console.log("Disciple agent deletion failed");
  //   }

  // get portfolio
  //   console.log(await agent.getPortfolio("DISCIPLE-AGENT-ID"));

  // get holdings
  //   console.log(await agent.getHoldings("DISCIPLE-AGENT-ID"));

  // get decisions
  //   console.log(await agent.getDecisions("DISCIPLE-AGENT-ID"));

  // create trade
  //   console.log(
  //     await agent.sellHolding("YOUR-DISCIPLE-ID", "HOLDING-ID", 10)
  //   );

  // get trades
  //   console.log(await agent.getTrades("YOUR-DISCIPLE-ID"));

  // buy recommendation
  //   console.log(
  //     await agent.getOptimalGains("YOUR-DISCIPLE-ID")
  //   );

  // update agent
  //   console.log(
  //     await agent.updateAgent("YOUR-DISCIPLE-ID", {
  //       ...createAgentParams,
  //       // updated parameters
  //       name: "MyUpdatedDisciple",
  //     })
  //   );

  // get status of task
  //   console.log(await agent.getTaskStatus("TASK-ID"));
}

main();

export default FereAgent;
