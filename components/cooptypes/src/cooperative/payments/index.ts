export type Currency = 'RUB' | 'Other'

export interface IBankAccount {
  currency: Currency
  card_number?: string // < номер карты
  bank_name: string // < наименование банка
  account_number: string // < номер счёта
  details: {
    bik: string // < бик
    corr: string // < корр счёт
    kpp: string // < кпп
  }
}

export interface ISbpDetails {
  phone: string
}

export type MethodTypes = 'sbp' | 'bank_transfer'

export interface IPaymentData {
  username: string
  method_id: number
  user_type: 'individual' | 'entrepreneur' | 'organization'
  method_type: MethodTypes
  is_default: boolean
  data: ISbpDetails | IBankAccount
  deleted?: boolean
  block_num?: number
}
