import LeadDetailRepository from 'data/repository/leadDetail';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../shared/interfaces/common/usecase';

export default class CreateCustomQuoteUseCase implements IUseCaseObservable {
  private leadDetailRepository: LeadDetailRepository;

  constructor() {
    this.leadDetailRepository = new LeadDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (body: any) =>
    this.leadDetailRepository.createCustomQuote(body?.payload);
}
