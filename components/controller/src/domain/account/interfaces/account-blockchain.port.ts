import type { RegistratorContract, SovietContract } from 'cooptypes';
import type { BlockchainAccountInterface } from '~/types/shared';

export interface AccountBlockchainPort {
  getBlockchainAccount(username: string): Promise<BlockchainAccountInterface | null>;
  getCooperatorAccount(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative | null>;
  getParticipantAccount(
    coopname: string,
    username: string
  ): Promise<SovietContract.Tables.Participants.IParticipants | null>;
  getUserAccount(username: string): Promise<RegistratorContract.Tables.Accounts.IAccount | null>;
  addParticipantAccount(data: RegistratorContract.Actions.AddUser.IAddUser): Promise<void>;
}

export const ACCOUNT_BLOCKCHAIN_PORT = Symbol('AccountBlockchainPort');