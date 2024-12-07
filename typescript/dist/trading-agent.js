"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class FereAgent {
    constructor(fereApiKey, fereUserId) {
        this.baseUrl = "https://api.fereai.xyz/ta";
        this.fereApiKey = fereApiKey;
        this.fereUserId = fereUserId;
    }
    getApiHeaders() {
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-FRIDAY-KEY": this.fereApiKey,
            "X-FERE-USERID": this.fereUserId,
        };
    }
    async createAgent(params) {
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
            const response = await axios_1.default.put(url, payload, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : null;
        }
        catch (error) {
            console.error("Request failed:", error);
            return null;
        }
    }
    async fetchDisciples() {
        const url = `${this.baseUrl}/ta/agent/${this.fereUserId}/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : [];
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
            return [];
        }
    }
    async getAgentDetails(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : null;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
            return null;
        }
    }
    async getPortfolio(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/portfolio/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getHoldings(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/holdings/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getTrades(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/trades/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getTradeRecommendations(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/decisions/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getOptimalGains(discipleAgentId) {
        const url = `${this.baseUrl}/ta/agent/${discipleAgentId}/buy/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async sellHolding(discipleAgentId, holdingId, quantity) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/sell/f${holdingId}/f${quantity}/`;
        const payload = {};
        try {
            const response = await axios_1.default.post(url, payload, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getTaskStatus(taskId) {
        const url = `${this.baseUrl}/task/status/${taskId}/`;
        const payload = {};
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async getDecisions(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/decisions/`;
        try {
            const response = await axios_1.default.get(url, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : null;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
            return null;
        }
    }
    async updateAgent(discipleId, payload) {
        const url = `${this.baseUrl}/agent/${discipleId}/`;
        try {
            const response = await axios_1.default.patch(url, {
                ...payload,
                user_id: this.fereUserId,
            }, {
                headers: this.getApiHeaders(),
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
    async deleteDisciple(discipleAgentId) {
        const url = `${this.baseUrl}/agent/${discipleAgentId}/`;
        const payload = {};
        try {
            const response = await axios_1.default.delete(url, {
                headers: this.getApiHeaders(),
                data: payload,
            });
            return response.status === 200 ? response.data : undefined;
        }
        catch (error) {
            console.error(`Request failed: ${error}`);
        }
    }
}
async function main() {
    const agent = new FereAgent("YOUR-USER-ID", "YOUR-API-KEY");
    const createAgentParams = {
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
exports.default = FereAgent;
