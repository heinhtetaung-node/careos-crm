import LeadRepository from 'data/repository/lead';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { ILeadSources } from 'shared/interfaces/common/lead/sources';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class UpdateLeadSourcesUseCase implements IUseCaseObservable {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn<ILeadSources, string> = (payload) =>
    this.leadRepository.updateLeadSources(payload);
}
