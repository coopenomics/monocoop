import type { SovietContract } from '../../contracts'
import type { ICooperative } from '../../contracts/registrator/tables/cooperatives'
import type { IIndividualData, IOrganizationData } from '../users'

export interface ICooperativeData extends IOrganizationData, ICooperative {
  members: MembersData[]
  chairman: IIndividualData
  totalMembers: number
}

export interface MembersData extends SovietContract.Interfaces.IBoardMember, IIndividualData {
  is_chairman: boolean
}

export interface IAnnounce {
  phone: string
  email: string
}

export interface IContacts {
  full_name: string
  full_address: string
  details: { inn: string, ogrn: string, kpp: string }
  phone: string
  email: string
  chairman: {
    first_name: string
    last_name: string
    middle_name: string
  }
}

export interface IVars {
  block_num?: number
  deleted?: boolean

  coopname: string
  full_abbr: string
  full_abbr_genitive: string
  full_abbr_dative: string
  short_abbr: string
  website: string
  name: string
  confidential_link: string
  confidential_email: string
  contact_email: string
  passport_request: 'yes' | 'no'
  wallet_agreement: {
    protocol_number: string
    protocol_day_month_year: string
  }
  signature_agreement: {
    protocol_number: string
    protocol_day_month_year: string
  }
  privacy_agreement: {
    protocol_number: string
    protocol_day_month_year: string
  }
  user_agreement: {
    protocol_number: string
    protocol_day_month_year: string
  }
  participant_application: {
    protocol_number: string
    protocol_day_month_year: string
  }
  coopenomics_agreement?: {
    protocol_number: string
    protocol_day_month_year: string
  }
}

/**
 * Используется для генераций документов в кооплейсе
 */
export interface ICommonRequest {
  hash: string
  title: string
  unit_of_measurement: string
  units: number
  unit_cost: string
  total_cost: string
  currency: string
  type: string
  program_id: number
}

export interface ICommonUser {
  full_name_or_short_name: string
  birthdate_or_ogrn: string
}

export interface IFirstLastMiddleName {
  first_name: string
  last_name: string
  middle_name: string
}

export interface ICommonProgram {
  name: string
}
