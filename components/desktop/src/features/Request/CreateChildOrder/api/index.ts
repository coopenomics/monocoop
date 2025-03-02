import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';

async function createChildOrder(
  data: Mutations.Cooplace.CreateChildOrder.IInput['data']
): Promise<Mutations.Cooplace.CreateChildOrder.IOutput[typeof Mutations.Cooplace.CreateChildOrder.name]> {

  const {[Mutations.Cooplace.CreateChildOrder.name]: result} = await client.Mutation(Mutations.Cooplace.CreateChildOrder.mutation, {
    variables: {
      data
    }
  })


  return result;
}

async function generateReturnByAssetStatement(
  data: Mutations.Cooplace.GenerateReturnByAssetStatement.IInput['data']
): Promise<Mutations.Cooplace.GenerateReturnByAssetStatement.IOutput[typeof Mutations.Cooplace.GenerateReturnByAssetStatement.name]> {
  const {[Mutations.Cooplace.GenerateReturnByAssetStatement.name]: result} = await client.Mutation(Mutations.Cooplace.GenerateReturnByAssetStatement.mutation, {
    variables: {
      data
    }
  })

  return result;
}

// async function createChildOrder(
//   params: ICreateChildOrder
// ): Promise<TransactResult | undefined> {
//   //TODO здесь передаём документ заявления на возврат имуществом (?)
//   const document = {
//     hash: '33CBC662E606F23F332B442BAB84F2D05BD498B66EF61BC918740606B05BD565',
//     public_key: 'PUB_K1_8YWRWjCdUQubPoHzT5ndvfhGKDf1ZL7v7Ge9iHoLtNp7wnVfG1',
//     signature: 'SIG_K1_KWeGQ48n78ybpkuVDf1M7nuGnT8pkPXFbYYMUXtFTFv2dEReMEmwW89r19dKmAVSFZwHTdxdqkB3ZQJeAS9CcQwb92E398',
//     meta: '',
//   } as IDocument;




//   const result = await transact({
//       account: ContractsList.Marketplace,
//       name: MarketContract.Actions.CreateOrder.actionName,
//       authorization: [
//         {
//           actor: params.username,
//           permission: 'active',
//         },
//       ],
//       data: {
//         params: {
//           username: params.username,
//           coopname: params.coopname,
//           parent_id: params.parent_id,
//           program_id: params.program_id,
//           units: params.units,
//           unit_cost: params.unit_cost,
//           product_lifecycle_secs: 0,
//           document,
//           data: '',
//           meta: '',
//         },
//       } as MarketContract.Actions.CreateOrder.ICreateOrder,

//   });

//   const requestsStore = useRequestStore();
//   requestsStore.loadUserChildOrders({
//     coopname: params.coopname,
//     username: params.username,
//   });

//   return result;
// }

export const api = {
  createChildOrder,
  generateReturnByAssetStatement
};
