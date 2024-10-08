import { TransactResult } from '@wharfkit/session';
import { SovietContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useUpdateBoard() {
  async function updateBoard(
    data: SovietContract.Actions.Boards.UpdateBoard.IUpdateBoard
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();
    console.log('action: ', data)
    const result = useGlobalStore().transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Boards.UpdateBoard.actionName,
      authorization: [
        {
          actor: session.username,
          permission: 'active',
        },
      ],
      data,
    });

    return result;
  }
  return { updateBoard };
}
