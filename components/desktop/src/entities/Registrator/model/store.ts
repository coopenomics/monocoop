import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { IGeneratedAccount } from 'src/shared/lib/types/user';
import { type ICreateUserData } from 'src/shared/lib/types/user/IUserData';
import type { Cooperative } from 'cooptypes';
import { useSystemStore } from 'src/entities/System/model';

const namespace = 'registrator';

// Начальное состояние для account
const initialAccountState: IGeneratedAccount = {
  username: '',
  private_key: '',
  public_key: ''
};

// Начальное состояние для userData
const initialUserDataState: ICreateUserData = {
  type: 'individual',
  individual_data: {
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    full_address: '',
    phone: '',
    email: '',
  },
  organization_data: {
    type: 'coop',
    short_name: '',
    full_name: '',
    represented_by: {
      first_name: '',
      last_name: '',
      middle_name: '',
      position: '',
      based_on: '',
    },
    country: 'Russia',
    city: '',
    full_address: '',
    fact_address: '',
    phone: '',
    email: '',
    details: {
      kpp: '',
      inn: '',
      ogrn: '',
    },
    bank_account: {
      currency: 'RUB',
      card_number: undefined,
      bank_name: '',
      account_number: '',
      details: {
        bik: '',
        corr: '',
        kpp: '',
      },
    },
  },
  entrepreneur_data: {
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    phone: '',
    email: '',
    country: 'Russia',
    city: '',
    full_address: '',
    details: {
      inn: '',
      ogrn: '',
    },
    bank_account: {
      currency: 'RUB',
      card_number: undefined,
      bank_name: '',
      account_number: '',
      details: {
        bik: '',
        corr: '',
        kpp: '',
      },
    },
  },
};

// Начальное состояние для любого документа
const initialDocumentState = {
  hash: '',
  meta: {} as Cooperative.Document.IMetaDocument,
  public_key: '',
  signature: '',
};

// Начальное состояние для payment
const initialPaymentState = {
  provider: '',
  details: {
    data: '',
  },
};

// Начальное состояние для agreements
const initialAgreementsState = {
  condidential: false,
  digital_signature: false,
  wallet: false,
  ustav: false,
  user: false,
  self_paid: false,
};
export const useRegistratorStore = defineStore(
  namespace,
  () => {
    const state = reactive({
      step: 1,
      role: 'user',
      email: '',
      selectedBranch: '',
      account: structuredClone(initialAccountState),
      userData: structuredClone(initialUserDataState),
      signature: '',
      inLoading: false,
      agreements: structuredClone(initialAgreementsState),
      statement: structuredClone(initialDocumentState),
      walletAgreement: structuredClone(initialDocumentState),
      privacyAgreement: structuredClone(initialDocumentState),
      signatureAgreement: structuredClone(initialDocumentState),
      userAgreement: structuredClone(initialDocumentState),
      payment: structuredClone(initialPaymentState),
      is_paid: false,
    });

    const stepNames = [
      'EmailInput',
      'SetUserData',
      'GenerateAccount',
      'SelectBranch',
      'ReadStatement',
      'SignStatement',
      'PayInitial',
      'WaitingRegistration',
      'Welcome',
    ] as const;

    type StepName = (typeof stepNames)[number];

    const steps = stepNames.reduce((acc, step, index) => {
      acc[step] = index + 1; // Индексы начинаются с 1
      return acc;
    }, {} as Record<StepName, number>);

    const system = useSystemStore();
    const isBranched = computed(() => system.info?.cooperator_account.is_branched);

    const filteredSteps = computed(() =>
      stepNames.filter(step => step !== 'SelectBranch' || isBranched.value)
    );

    const isStepDone = (stepName: StepName) => {
      const stepIndex = steps[stepName];
      return stepIndex < state.step;
    };

    const isStep = (stepName: StepName) => {
      const stepIndex = steps[stepName];
      return stepIndex === state.step;
    };

    const next = () => {
      if (state.step < filteredSteps.value.length) {
        state.step += 1;
      }
    };

    const prev = () => {
      if (state.step > 1) {
        state.step -= 1;
      }
    };

    const goTo = (targetStep: StepName) => {
      const targetIndex = steps[targetStep];
      if (targetIndex > 0) {
        state.step = targetIndex;
      }
    };

    const clearAddUserState = () => reactive({
      spread_initial: false,
      created_at: '',
      initial: 0,
      minimum: 0,
      org_initial: 0,
      org_minimum: 0,
    });

    const addUserState = clearAddUserState();

    const clearUserData = () => {
      state.step = 1;
      state.selectedBranch = ''
      state.email = '';
      state.account = structuredClone(initialAccountState);
      state.agreements = structuredClone(initialAgreementsState);
      state.userData = structuredClone(initialUserDataState);
      state.payment = structuredClone(initialPaymentState);
      state.is_paid = false;
      state.statement = structuredClone(initialDocumentState);
      state.walletAgreement = structuredClone(initialDocumentState);
      state.privacyAgreement = structuredClone(initialDocumentState);
      state.signatureAgreement = structuredClone(initialDocumentState);
      state.userAgreement = structuredClone(initialDocumentState);
    };

    return {
      state,
      steps,
      filteredSteps,
      next,
      prev,
      goTo,
      isStepDone,
      isStep,
      clearUserData,
      addUserState,
      isBranched,
    };
  },
  {
    persist: true,
  }
);
