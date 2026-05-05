import LeadRepository from 'data/repository/lead';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class GetListDocumentLeadUseCase implements IUseCaseObservable {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (payload) =>
    this.leadRepository.getLeadUploadedDocuments(payload);
}
