import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import User from '../../src/models/user.model';
import { generateUsername } from '../utils/generateUsername';
import { Cooperative } from 'cooptypes';

const password = 'password1';
const email1 = faker.internet.email().toLowerCase();

export const participantOne = {
  email: email1,
  password,
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  role: 'user',
  referer: '',
  type: 'individual',
  individual_data: {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email1,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
};