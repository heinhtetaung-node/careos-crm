import LeadRepository from 'data/repository/lead';
import ResponseModel from 'models/response';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { ILeadScoreResponse } from 'shared/interfaces/common/lead/sources';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetLeadSourceScoreUseCase implements IUseCaseObservable {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn<string, ResponseModel<ILeadScoreResponse>> = (
    payload
  ) => this.leadRepository.getLeadSourceScore(payload);
}
