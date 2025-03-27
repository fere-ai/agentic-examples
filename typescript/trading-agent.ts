import axios, { AxiosResponse } from "axios";

interface CreateAgentParams {
  fere_user_id: string;
  name?: string;
  description?: string;
  persona?: string;
  data_source?: string;
  decision_prompt_pool?: string;
  decision_prompt_portfolio?: string;
  twitter_username?: string;
  fc_username?: string;
  simulation?: boolean;
  simulation_initial_usd?: number;
  simulation_initial_native?: number;
  max_investment_per_session?: number;
  stop_loss?: number;
  trailing_stop_loss?: number;
  take_profit?: number;
  chain?: string;
  mode?: string;
  parent_ids?: string[];
  investment_for_buy?: number;
  investment_for_buy_usd?: number;
}

interface UpdateAgentParams {
  [key: string]: any;
}

class DiscipleClient {
  private api_key: string;
  private user_id: string;
  private base_url: string = "http://localhost:8001/";
  
  constructor(api_key: string, user_id: string) {
    this.api_key = api_key;
    this.user_id = user_id;
  }

  get api_headers(): Record<string, string> {
    return {
      "X-FRIDAY-KEY": this.api_key,
      "Content-Type": "application/json",
      "X-FERE-USERID": this.user_id,
    };
  }

  async create_agent(params: CreateAgentParams): Promise<any> {
    const url = `${this.base_url}agent/`;
    
    const payload = {
      user_id: params.fere_user_id,
      name: params.name,
      description: params.description,
      persona: params.persona,
      chain: params.chain || 'base',
      data_source: params.data_source,
      decision_prompt_pool: params.decision_prompt_pool,
      decision_prompt_portfolio: params.decision_prompt_portfolio,
      twitter_username: params.twitter_username,
      fc_username: params.fc_username,
      dry_run: params.simulation || false,
      dry_run_initial_usd: params.simulation_initial_usd,
      dry_run_initial_native: params.simulation_initial_native || 1.0,
      max_investment_per_session: params.max_investment_per_session,
      stop_loss: params.stop_loss || 0.6,
      trailing_stop_loss: params.trailing_stop_loss,
      take_profit: params.take_profit || 0.5,
      mode: params.mode || 'MANUAL',
      parent_ids: params.parent_ids,
      investment_for_buy: params.investment_for_buy,
      investment_for_buy_usd: params.investment_for_buy_usd || 10.0,
    };

    try {
      const response = await axios.put(url, payload, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  }

  async get_agent(agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${agent_id}`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    }
  }

  async fetch_disciples(fere_user_id: string): Promise<any[]> {
    const url = `${this.base_url}agent/user/${fere_user_id}/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        const data = response.data;
        console.log(`Disciples Created: ${data.length}\n`);
        
        for (const disciple of data) {
          console.log(`Name: ${disciple.name}`);
          console.log(`ID: ${disciple.id}\n`);
        }
        
        return data;
      } else {
        console.error(`Failed to fetch disciples: ${response.statusText}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching disciples:', error);
      return [];
    }
  }

  async get_portfolio(disciple_agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/portfolio/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 60000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return null;
    }
  }

  async get_holdings(disciple_agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/holdings/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting holdings:', error);
      return null;
    }
  }

  async get_trades(disciple_agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/trades/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting trades:', error);
      return null;
    }
  }

  async get_trade_recommendations(disciple_agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/decisions/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting trade recommendations:', error);
      return null;
    }
  }

  async get_optimal_gains(
    disciple_agent_id: string, 
    page: number = 1, 
    page_size: number = 10, 
    sort_by_latest_signal: boolean = true, 
    sort_column: string = 'noticed_at', 
    sort_order: string = 'desc'
  ): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/calls/`;
    
    const params = {
      page,
      page_size,
      sort_by_latest_signal,
      sort_column,
      sort_order
    };
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        params,
        timeout: 20000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting optimal gains:', error);
      return null;
    }
  }

  async get_decisions(disciple_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_id}/decisions/`;
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error getting decisions:', error);
      return null;
    }
  }

  async update_agent(disciple_id: string, params: UpdateAgentParams): Promise<any> {
    const url = `${this.base_url}agent/${disciple_id}/`;
    
    try {
      const response = await axios.patch(url, params, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      return null;
    }
  }

  async schedule_sell(disciple_id: string, ca: string, quantity: string | number = "all"): Promise<any> {
    const url = `${this.base_url}/agent/${disciple_id}/sell/${ca}/${quantity}/`;
    const payload = {};
    
    try {
      const response = await axios.post(url, payload, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.log(`Got response code ${response.status} with message ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.error('Error scheduling sell:', error);
      return null;
    }
  }

  async schedule_buy(
    disciple_id: string, 
    ca: string, 
    quantity: number | null, 
    value_usd: number | null, 
    slippage: number = 1.0
  ): Promise<any> {
    const url = `${this.base_url}/agent/${disciple_id}/buy/`;
    
    const payload = {
      ca,
      quantity,
      value_usd,
      slippage
    };
    
    try {
      const response = await axios.post(url, payload, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error scheduling buy:', error);
      return null;
    }
  }

  async check_task_status(task_id: string): Promise<any> {
    const url = `${this.base_url}/task/status/${task_id}/`;
    const payload = {};
    
    try {
      const response = await axios.get(url, {
        headers: this.api_headers,
        data: payload,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error checking task status:', error);
      return null;
    }
  }

  async delete_disciple(disciple_agent_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_agent_id}/`;
    
    try {
      const response = await axios.delete(url, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error deleting disciple:', error);
      return null;
    }
  }

  async add_parents(disciple_id: string, parents: string[]): Promise<any> {
    const url = `${this.base_url}agent/${disciple_id}/parents/`;
    const payload = { parent_ids: parents };
    
    try {
      const response = await axios.patch(url, payload, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error adding parents:', error);
      return null;
    }
  }

  async delete_parents(disciple_id: string, parent_ids: string[]): Promise<any> {
    const url = `${this.base_url}agent/${disciple_id}/parents/`;
    const payload = { parent_ids };
    
    try {
      const response = await axios.delete(url, {
        headers: this.api_headers,
        data: payload,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error deleting parents:', error);
      return null;
    }
  }

  async schedule_sync(disciple_id: string): Promise<any> {
    const url = `${this.base_url}agent/${disciple_id}/sync/`;
    
    try {
      const response = await axios.patch(url, {}, {
        headers: this.api_headers,
        timeout: 10000
      });

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error scheduling sync:', error);
      return null;
    }
  }
}

export default DiscipleClient;
