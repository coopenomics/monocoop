import type { JSONSchemaType } from 'ajv'
import type { OrganizationData } from '../Models/Organization'
import { BankAccountSchema } from './BankAccountSchema'

export const organizationSchema: JSONSchemaType<OrganizationData> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    type: { type: 'string', enum: ['coop', 'ooo', 'oao', 'zao', 'pao', 'ao'] },
    is_cooperative: { type: 'boolean' },
    short_name: { type: 'string' },
    full_name: { type: 'string' },
    represented_by: {
      type: 'object',
      required: ['first_name', 'last_name', 'position', 'based_on'],
      properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        middle_name: { type: 'string' },
        position: { type: 'string' },
        based_on: { type: 'string' },
      },
      additionalProperties: true,
    },
    country: { type: 'string', enum: ['Russia', 'Other'] },
    city: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
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
    bank_account: {
      type: 'object',
      required: BankAccountSchema.required,
      properties: BankAccountSchema.properties,
    },
  },
  required: ['username', 'type', 'is_cooperative', 'short_name', 'full_name', 'represented_by', 'country', 'city', 'full_address', 'email', 'phone', 'details', 'bank_account'],
  additionalProperties: true,
}