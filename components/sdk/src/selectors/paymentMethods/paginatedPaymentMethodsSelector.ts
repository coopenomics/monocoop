import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import { paginationSelector } from "../../utils/paginationSelector";
import { Selector, type ModelTypes, type ValueTypes } from "../../zeus";
import { rawPaymentMethodSelector } from "./paymentMethodSelector";

export const rawPaymentMethodPaginationSelector = {...paginationSelector, items: rawPaymentMethodSelector};

// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['PaymentMethodPaginationResult']> = rawPaymentMethodPaginationSelector;

export type paymentMethodPaginationModel = ModelTypes['PaymentMethodPaginationResult']
export const paymentMethodPaginationSelector = Selector('PaymentMethodPaginationResult')(rawPaymentMethodPaginationSelector);
