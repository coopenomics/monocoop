import { RegistratorContract } from 'cooptypes';
import { fetchTable } from 'src/shared/api';

async function loadCoops(): Promise<RegistratorContract.Tables.Cooperatives.ICooperative[]> {
  const requests = (await fetchTable(
    RegistratorContract.contractName.production,
    RegistratorContract.contractName.production,
    RegistratorContract.Tables.Cooperatives.tableName
  )) as RegistratorContract.Tables.Cooperatives.ICooperative[];


  return requests;
}

export const api = {
  loadCoops,
}