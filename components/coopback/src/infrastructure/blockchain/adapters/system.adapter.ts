import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import type { SystemBlockchainPort } from '~/domain/system/interfaces/system-blockchain.port';
import type { GetInfoResult } from '~/types/shared/blockchain.types';

@Injectable()
export class SystemBlockchainAdapter implements SystemBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getInfo(coopname: string): Promise<GetInfoResult> {
    return this.blockchainService.getInfo();
  }
}
