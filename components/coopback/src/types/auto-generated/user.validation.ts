/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface IAddUser {
  created_at: string;
  email: string;
  entrepreneur_data?: {
    bank_account: {
      account_number: string;
      bank_name: string;
      card_number?: string;
      currency: 'RUB' | 'Other';
      details: {
        bik: string;
        corr: string;
        kpp: string;
      };
    };
    birthdate: string;
    city: string;
    country: 'Russia' | 'Other';
    details: {
      inn: string;
      ogrn: string;
    };
    email: string;
    first_name: string;
    full_address: string;
    last_name: string;
    middle_name: string;
    phone: string;
  };
  individual_data?: {
    birthdate: string;
    email: string;
    first_name: string;
    full_address: string;
    last_name: string;
    middle_name: string;
    phone: string;
  };
  initial: string;
  minimum: string;
  organization_data?: {
    bank_account: {
      account_number: string;
      bank_name: string;
      card_number?: string;
      currency: 'RUB' | 'Other';
      details: {
        bik: string;
        corr: string;
        kpp: string;
      };
    };
    city: string;
    country: 'Russia' | 'Other';
    details: {
      inn: string;
      ogrn: string;
    };
    email: string;
    full_address: string;
    full_name: string;
    is_cooperative: boolean;
    phone: string;
    represented_by: {
      based_on: string;
      first_name: string;
      last_name: string;
      middle_name: string;
      position: string;
    };
    short_name: string;
    type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
  };
  referer?: string;
  spread_initial: boolean;
  type: 'individual' | 'entrepreneur' | 'organization';
}

export interface ICreateUser {
  email: string;
  entrepreneur_data?: {
    bank_account: {
      account_number: string;
      bank_name: string;
      card_number?: string;
      currency: 'RUB' | 'Other';
      details: {
        bik: string;
        corr: string;
        kpp: string;
      };
    };
    birthdate: string;
    city: string;
    country: 'Russia' | 'Other';
    details: {
      inn: string;
      ogrn: string;
    };
    email: string;
    first_name: string;
    full_address: string;
    last_name: string;
    middle_name: string;
    phone: string;
  };
  individual_data?: {
    birthdate: string;
    email: string;
    first_name: string;
    full_address: string;
    last_name: string;
    middle_name: string;
    phone: string;
  };
  organization_data?: {
    bank_account: {
      account_number: string;
      bank_name: string;
      card_number?: string;
      currency: 'RUB' | 'Other';
      details: {
        bik: string;
        corr: string;
        kpp: string;
      };
    };
    city: string;
    country: 'Russia' | 'Other';
    details: {
      inn: string;
      ogrn: string;
    };
    email: string;
    full_address: string;
    full_name: string;
    is_cooperative: boolean;
    phone: string;
    represented_by: {
      based_on: string;
      first_name: string;
      last_name: string;
      middle_name: string;
      position: string;
    };
    short_name: string;
    type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
  };
  public_key: string;
  referer?: string;
  role: 'user';
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}

export interface IDocument {
  hash: string;
  meta: object;
  public_key: string;
  signature: string;
}

export interface IEntrepreneurData {
  bank_account: {
    account_number: string;
    bank_name: string;
    card_number?: string;
    currency: 'RUB' | 'Other';
    details: {
      bik: string;
      corr: string;
      kpp: string;
    };
  };
  birthdate: string;
  city: string;
  country: 'Russia' | 'Other';
  details: {
    inn: string;
    ogrn: string;
  };
  email: string;
  first_name: string;
  full_address: string;
  last_name: string;
  middle_name: string;
  phone: string;
}

export interface IIndividualData {
  birthdate: string;
  email: string;
  first_name: string;
  full_address: string;
  last_name: string;
  middle_name: string;
  phone: string;
}

export interface IJoinCooperative {
  statement: {
    hash: string;
    meta: object;
    public_key: string;
    signature: string;
  };
  username: string;
}

export interface IOrganizationData {
  bank_account: {
    account_number: string;
    bank_name: string;
    card_number?: string;
    currency: 'RUB' | 'Other';
    details: {
      bik: string;
      corr: string;
      kpp: string;
    };
  };
  city: string;
  country: 'Russia' | 'Other';
  details: {
    inn: string;
    ogrn: string;
  };
  email: string;
  full_address: string;
  full_name: string;
  is_cooperative: boolean;
  phone: string;
  represented_by: {
    based_on: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    position: string;
  };
  short_name: string;
  type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
}

export interface RAddUser {
  body: {
    created_at: string;
    email: string;
    entrepreneur_data?: {
      bank_account: {
        account_number: string;
        bank_name: string;
        card_number?: string;
        currency: 'RUB' | 'Other';
        details: {
          bik: string;
          corr: string;
          kpp: string;
        };
      };
      birthdate: string;
      city: string;
      country: 'Russia' | 'Other';
      details: {
        inn: string;
        ogrn: string;
      };
      email: string;
      first_name: string;
      full_address: string;
      last_name: string;
      middle_name: string;
      phone: string;
    };
    individual_data?: {
      birthdate: string;
      email: string;
      first_name: string;
      full_address: string;
      last_name: string;
      middle_name: string;
      phone: string;
    };
    initial: string;
    meta?: string;
    minimum: string;
    organization_data?: {
      bank_account: {
        account_number: string;
        bank_name: string;
        card_number?: string;
        currency: 'RUB' | 'Other';
        details: {
          bik: string;
          corr: string;
          kpp: string;
        };
      };
      city: string;
      country: 'Russia' | 'Other';
      details: {
        inn: string;
        ogrn: string;
      };
      email: string;
      full_address: string;
      full_name: string;
      is_cooperative: boolean;
      phone: string;
      represented_by: {
        based_on: string;
        first_name: string;
        last_name: string;
        middle_name: string;
        position: string;
      };
      short_name: string;
      type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
    };
    referer?: string;
    spread_initial: boolean;
    type: 'individual' | 'entrepreneur' | 'organization';
  };
}

export interface RCreateUser {
  body: {
    email: string;
    entrepreneur_data?: {
      bank_account: {
        account_number: string;
        bank_name: string;
        card_number?: string;
        currency: 'RUB' | 'Other';
        details: {
          bik: string;
          corr: string;
          kpp: string;
        };
      };
      birthdate: string;
      city: string;
      country: 'Russia' | 'Other';
      details: {
        inn: string;
        ogrn: string;
      };
      email: string;
      first_name: string;
      full_address: string;
      last_name: string;
      middle_name: string;
      phone: string;
    };
    individual_data?: {
      birthdate: string;
      email: string;
      first_name: string;
      full_address: string;
      last_name: string;
      middle_name: string;
      phone: string;
    };
    organization_data?: {
      bank_account: {
        account_number: string;
        bank_name: string;
        card_number?: string;
        currency: 'RUB' | 'Other';
        details: {
          bik: string;
          corr: string;
          kpp: string;
        };
      };
      city: string;
      country: 'Russia' | 'Other';
      details: {
        inn: string;
        ogrn: string;
      };
      email: string;
      full_address: string;
      full_name: string;
      is_cooperative: boolean;
      phone: string;
      represented_by: {
        based_on: string;
        first_name: string;
        last_name: string;
        middle_name: string;
        position: string;
      };
      short_name: string;
      type: 'coop' | 'ooo' | 'oao' | 'zao' | 'pao' | 'ao';
    };
    public_key: string;
    referer?: string;
    role: 'user';
    type: 'individual' | 'entrepreneur' | 'organization';
    username: string;
  };
}

export interface RGetUser {
  params?: {
    username?: string;
  };
}

export interface RGetUsers {
  query?: {
    limit?: number;
    page?: number;
    role?: string;
    sortBy?: string;
    username?: string;
  };
}

export interface RJoinCooperative {
  body: {
    statement: {
      hash: string;
      meta: object;
      public_key: string;
      signature: string;
    };
    username: string;
  };
}

export interface RUpdateUser {
  body?: {
    email?: string;
  };
  params?: {
    username: string;
  };
}