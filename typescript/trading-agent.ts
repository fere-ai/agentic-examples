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
  userId: string;
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

interface Disciple {
  name: string;
  id: string;
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

  async createAgent(params: CreateAgentParams): Promise<any | null> {
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
      const response: AxiosResponse = await axios.get(url, {
        headers: this.getApiHeaders(),
      });

      return response.status === 200 ? response.data : [];
    } catch (error) {
      console.error(`Request failed: ${error}`);
      return [];
    }
  }

  async getPortfolio(discipleAgentId: string): Promise<any | void> {
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

  async getHoldings(discipleAgentId: string): Promise<any[] | void> {
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

  async getTrades(discipleAgentId: string): Promise<any[] | void> {
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

  async updateAgent(
    discipleId: string,
    payload: UpdateAgentPayload
  ): Promise<any | void> {
    const url = `${this.baseUrl}/agent/${discipleId}/`;

    try {
      const response: AxiosResponse = await axios.patch(url, payload, {
        headers: this.getApiHeaders(),
      });

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
}

main();

export default FereAgent;
