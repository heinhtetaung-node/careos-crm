import LeadDetailRepository from 'data/repository/leadDetail';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../shared/interfaces/common/usecase';

export default class CreateAttachmentUseCase implements IUseCaseObservable {
  private leadDetailRepository: LeadDetailRepository;

  constructor() {
    this.leadDetailRepository = new LeadDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (data) =>
    this.leadDetailRepository.createAttachment(data);
}
