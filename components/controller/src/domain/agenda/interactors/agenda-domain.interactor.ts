import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { Injectable } from '@nestjs/common';
import { blockchainService } from '~/services';
import config from '~/config/config';
import { SovietContract } from 'cooptypes';
import type { AgendaWithDocumentsDomainInterface } from '../interfaces/agenda-with-documents-domain.interface';
import { getActions } from '~/utils/getFetch';
import type { VotingAgendaDomainInterface } from '../interfaces/voting-agenda-domain.interface';

@Injectable()
export class AgendaDomainInteractor {
  constructor(private readonly documentDomainService: DocumentDomainService) {}

  async getAgenda(): Promise<AgendaWithDocumentsDomainInterface[]> {
    // Шаг 1: Загрузить повестку дня
    const agenda = await this.loadAgenda(config.coopname);

    // Шаг 2: Построить комплексную повестку (complexAgenda)
    const complexAgenda: AgendaWithDocumentsDomainInterface[] = [];

    for (const { action, table } of agenda) {
      // Создание пакета документов для каждого действия
      const documents = await this.documentDomainService.buildDocumentPackage(action);

      // Проверяем наличие заявления, прежде чем добавлять в комплексную повестку
      // Делаем только потому что в локальной разработке заявлений после перезапуска блокчейна может и не быть в истории цепочки,
      // а это ломает отображение на фронте. При нормальные условиях заявление всегда должно быть.
      if (documents.statement?.document) {
        complexAgenda.push({
          table,
          action,
          documents,
        });
      }
    }

    // Шаг 3: Вернуть итоговую комплексную повестку
    return complexAgenda;
  }

  /**
   * Загружает повестку дня (agenda) на основании решений и связанных действий.
   */
  async loadAgenda(coopname: string): Promise<VotingAgendaDomainInterface[]> {
    //TODO блокчейн-адаптер здесь повесить
    const api = await blockchainService.getApi();

    // Загружаем таблицу решений
    const decisions = (await blockchainService.lazyFetch(
      api,
      SovietContract.contractName.production as string,
      coopname,
      'decisions'
    )) as SovietContract.Tables.Decisions.IDecision[];

    const agenda: VotingAgendaDomainInterface[] = [];

    for (const decision of decisions) {
      // Ищем экшен, связанный с конкретным решением
      const actionResponse = await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
        filter: JSON.stringify({
          account: SovietContract.contractName.production,
          name: SovietContract.Actions.Registry.NewSubmitted.actionName,
          receiver: process.env.COOPNAME,
          'data.decision_id': String(decision.id),
        }),
        page: 1,
        limit: 1,
      });

      const action = actionResponse?.results?.[0];
      if (action) {
        agenda.push({
          table: decision,
          action,
        });
      }
    }

    return agenda;
  }
}
