import { pluck } from 'rxjs/operators';

import LeadRepository from 'data/repository/lead';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { IPostLeadRejection } from 'shared/interfaces/common/lead/detail';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class PostLeadRejectionUseCase implements IUseCaseObservable {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn<IPostLeadRejection, string> = (payload) =>
    this.leadRepository.postLeadRejection(payload).pipe(pluck('data'));
}
