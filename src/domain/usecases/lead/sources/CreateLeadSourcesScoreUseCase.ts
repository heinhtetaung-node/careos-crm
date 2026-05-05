import LeadRepository from 'data/repository/lead';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { ICreateScore } from 'shared/interfaces/common/lead/sources';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class CreateLeadSourcesScoreUseCase
  implements IUseCaseObservable
{
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn<ICreateScore, string> = (payload) =>
    this.leadRepository.createLeadSourcesScore(payload);
}
