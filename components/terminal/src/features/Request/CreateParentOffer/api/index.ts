import { TransactResult } from '@wharfkit/session';
import { ICreateOffer } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { ILoadUserParentOffers } from 'src/entities/Request';
import { IDocument } from 'src/shared/lib/types/document';
import { MarketContract } from 'cooptypes';

async function createParentOffer(
  params: ICreateOffer
): Promise<TransactResult | undefined> {
  //TODO здесь передаём пустой документ
  const document = {
    hash: '',
    public_key: '',
    signature: '',
    meta: '',
  } as IDocument;

  const result = await transact({
    actions: [
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.CreateOffer.actionName,
        authorization: [
          {
            actor: params.username,
            permission: 'active',
          },
        ],
        data: {
          params: {
            username: params.username,
            coopname: params.coopname,
            parent_id: 0,
            program_id: params.program_id,
            pieces: params.pieces,
            unit_cost: params.unit_cost,
            product_lifecycle_secs: params.product_lifecycle_secs,
            document,
            data: JSON.stringify(params.data),
            meta: '',
          },
        } as MarketContract.Actions.CreateOffer.ICreateOffer,
      },
    ],
  });

  const requestsStore = useRequestStore();
  requestsStore.loadUserParentOffers({
    coopname: params.coopname,
    username: params.username,
  } as ILoadUserParentOffers);

  return result;
}

export const api = {
  createParentOffer,
};
