import { Observable } from 'rxjs';

import LeadRepository from 'data/repository/lead';
import { ISummaryCall } from 'shared/interfaces/common/lead/detail';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class CreateRejectionUseCase implements IUseCaseObservable {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute = (payload: ISummaryCall): Observable<string> =>
    this.leadRepository.createRejection(payload);
}
