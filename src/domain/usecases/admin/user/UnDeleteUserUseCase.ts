import { executeWithoutPayloadFn } from 'shared/interfaces/common';

import AdminRepository from '../../../../data/repository/admin';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class UnDeleteUserUseCase implements IUseCaseObservable {
  private adminRepository: AdminRepository;

  constructor(private payload: string) {
    this.adminRepository = new AdminRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.adminRepository.unDeleteUser(this.payload);
}
