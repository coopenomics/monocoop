import { systemInfoSelector } from '../../selectors';
import { $, Selector, type GraphQLTypes, type InputType, type ModelTypes } from '../../zeus';

export const name = 'installSystem'

export const mutation = Selector('Mutation')({
  [name]: [{data: $('data', 'Install!')}, systemInfoSelector]
});

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown;

  data: ModelTypes['Install']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>;