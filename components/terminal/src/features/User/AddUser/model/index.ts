import { api } from '../api';

import { useRegistratorStore } from 'src/entities/Registrator'

import { IAddUser } from 'coopback';

import emailRegex from 'email-regex';
import { useCooperativeStore } from 'src/entities/Cooperative';
const emailValidator = emailRegex({ exact: true });

export function useAddUser() {
  const { state, addUserState } = useRegistratorStore()

  function emailIsValid(email: string): boolean {
    return emailValidator.test(email);
  }

  async function addUser(
  ): Promise<void> {
    const coop = useCooperativeStore()

    const synthData = { type: state.userData.type } as any;

    let initial = ''
    let minimum = ''

    if (synthData.type === 'individual') {
      console.log('on add inidividual', state.userData, addUserState)

      synthData.individual_data = state.userData.individual_data;
      initial = `${addUserState.initial.toFixed(4)} ${coop.governSymbol}`
      minimum = `${addUserState.minimum.toFixed(4)} ${coop.governSymbol}`

    } else if (synthData.type === 'organization') {
      synthData.organization_data = state.userData.organization_data;
      initial = `${addUserState.org_initial.toFixed(4)} ${coop.governSymbol}`
      minimum = `${addUserState.org_minimum.toFixed(4)} ${coop.governSymbol}`

    } else if (synthData.type === 'entrepreneur') {
      synthData.entrepreneur_data = state.userData.entrepreneur_data;
      initial = `${addUserState.initial.toFixed(4)} ${coop.governSymbol}`
      minimum = `${addUserState.minimum.toFixed(4)} ${coop.governSymbol}`
    }

    const data: IAddUser = {
      ...synthData,
      email: state.email,
      created_at: addUserState.created_at,
      initial,
      minimum,
      spread_initial: addUserState.spread_initial,
    };
    console.log('addUser: ', data)
    await api.addUser(data);

  }

  return {
    addUser,
    emailIsValid
  };
}