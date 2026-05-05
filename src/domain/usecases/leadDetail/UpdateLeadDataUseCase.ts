import LeadDetailRepository from 'data/repository/leadDetail';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class UpdateLeadDataUseCase implements IUseCaseObservable {
  private leadDetailRepository: LeadDetailRepository;

  constructor() {
    this.leadDetailRepository = new LeadDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (data) => {
    if (data.body)
      return this.leadDetailRepository.updateLead(data.leadId, data.body);
    return this.leadDetailRepository.updateLeadData(data);
  };
}
