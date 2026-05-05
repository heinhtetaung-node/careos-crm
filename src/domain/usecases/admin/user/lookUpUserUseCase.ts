import UsersRepository from 'data/repository/admin/user';
import { executeWithoutPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class LookUpUserUsecase implements IUseCaseObservable {
  private userRepository: UsersRepository;

  constructor() {
    this.userRepository = new UsersRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () => this.userRepository.lookUpUser();
}
