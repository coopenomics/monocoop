import { APIClient, PrivateKey, Action } from '@wharfkit/antelope';
import { ContractKit, Table } from '@wharfkit/contract';
import { Session, TransactResult } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import type { BlockchainConfig, IndexPosition } from '../types/blockchain/blockchain.types';

export class Blockchain {
  private readonly apiClient: APIClient;
  private readonly contractKit: ContractKit;
  private session?: Session;

  constructor(private readonly config: BlockchainConfig) {
    this.apiClient = new APIClient({ url: config.blockchainUrl });
    this.contractKit = new ContractKit({ client: this.apiClient });
  }

  public setWif(username: string, wif: string): this {
    this.session = new Session({
      actor: username,
      permission: 'active',
      chain: {
        id: this.config.chainId,
        url: this.config.blockchainUrl,
      },
      walletPlugin: new WalletPluginPrivateKey(PrivateKey.fromString(wif)),
    });
    
    return this
  }

  async transact(actionOrActions: any | any[], broadcast = true): Promise<TransactResult> {
    if (!this.session) throw new Error('Session is not initialized.');
    const actions = Array.isArray(actionOrActions)
      ? await Promise.all(actionOrActions.map((action) => this.formActionFromAbi(action)))
      : [await this.formActionFromAbi(actionOrActions)];

    return this.session.transact({ actions }, { broadcast });
  }

  async getAllRows<T = any>(code: string, scope: string, tableName: string): Promise<T[]> {
    const abi = await this.getAbi(code);
    const table = this.createTable(code, tableName, abi);
    const rows = await table.all({ scope });
    return JSON.parse(JSON.stringify(rows)) as T[];
  }

  async query<T = any>(
    code: string,
    scope: string,
    tableName: string,
    options: {
      indexPosition?: IndexPosition;
      from?: string | number;
      to?: string | number;
      maxRows?: number;
    } = { indexPosition: 'primary' }
  ): Promise<T[]> {
    const { indexPosition = 'primary', from, to, maxRows } = options;
    const abi = await this.getAbi(code);
    const table = this.createTable(code, tableName, abi);

    const rows = await table.query({
      scope,
      index_position: indexPosition,
      from,
      to,
      maxRows,
    });

    return JSON.parse(JSON.stringify(rows)) as T[];
  }

  async getRow<T = any>(
    code: string,
    scope: string,
    tableName: string,
    primaryKey: string | number,
    indexPosition: IndexPosition = 'primary'
  ): Promise<T | null> {
    const abi = await this.getAbi(code);
    const table = this.createTable(code, tableName, abi);

    const row = await table.get(String(primaryKey), {
      scope,
      index_position: indexPosition,
    });

    return row ? (JSON.parse(JSON.stringify(row)) as T) : null;
  }

  private async formActionFromAbi(action: any): Promise<Action> {
    const abi = await this.getAbi(action.account);
    return Action.from(action, abi);
  }

  private async getAbi(account: string): Promise<any> {
    const { abi } = await this.apiClient.v1.chain.get_abi(account);
    if (!abi) throw new Error(`ABI for account "${account}" not found.`);
    return abi;
  }

  private createTable(code: string, tableName: string, abi: any): Table {
    return new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });
  }
}
