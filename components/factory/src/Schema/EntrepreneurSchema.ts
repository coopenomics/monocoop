import type { JSONSchemaType } from 'ajv'
import type { ExternalEntrepreneurData } from '../Models/Entrepreneur'
import { BankAccountSchema } from './BankAccountSchema'

export const entrepreneurSchema: JSONSchemaType<ExternalEntrepreneurData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    middle_name: { type: 'string' },
    birthdate: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    country: { type: 'string' },
    city: { type: 'string' },
    full_address: { type: 'string' },
    details: {
      type: 'object',
      required: ['inn', 'ogrn'],
      properties: {
        inn: { type: 'string' },
        ogrn: { type: 'string' },
      },
      additionalProperties: true,
    },
    // bank_account: {
    //   type: 'object',
    //   required: BankAccountSchema.required,
    //   properties: BankAccountSchema.properties,
    // },
    deleted: { type: 'boolean', nullable: true },
    block_num: { type: 'number', nullable: true },
  },
  required: ['username', 'email', 'first_name', 'last_name', 'birthdate', 'phone', 'country', 'city', 'full_address', 'details'],
  additionalProperties: true,
}
