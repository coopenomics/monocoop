import type { SovietContract } from 'cooptypes';
import type { BlockchainActionDomainInterface } from './blockchain-action-domain.interface';

export interface VotingAgendaDomainInterface {
  table: SovietContract.Tables.Decisions.IDecision;
  action: BlockchainActionDomainInterface;
}