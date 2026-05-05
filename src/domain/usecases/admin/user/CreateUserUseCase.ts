import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { ICreateUser } from 'shared/interfaces/common/admin/user';

import AdminRepository from '../../../../data/repository/admin';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class CreateUserUseCase implements IUseCaseObservable {
  private adminRepository: AdminRepository;

  constructor(private payload: ICreateUser) {
    this.adminRepository = new AdminRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.adminRepository.createUser(this.payload);
}
