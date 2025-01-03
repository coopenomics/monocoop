import * as Permissions from '../../../common/permissions'
import type * as Registrator from '../../../interfaces/registrator'
import { Actors } from '../../../common'

export const authorizations = [{ permissions: [Permissions.active], actor: Actors._coopname }] as const

/**
 * Имя действия
 */
export const actionName = 'enabranches'

/**
 * @interface
 * @private
 */
export type IEnableBranches = Registrator.IEnabranches
