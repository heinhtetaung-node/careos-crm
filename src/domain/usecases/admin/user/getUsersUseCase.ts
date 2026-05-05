import UsersRepository from 'data/repository/admin/user';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetUsersUseCase implements IUseCaseObservable {
  private userRepository: UsersRepository;

  constructor() {
    this.userRepository = new UsersRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (payload) => {
    const searchPayload = {
      pageSize: payload.pageSize,
      pageToken: payload.pageToken,
      orderBy: payload?.orderBy || '',
      showDeleted: payload.showDeleted,
      filter: payload.filter,
    };
    return this.userRepository.getUserCloud(searchPayload);
  };
}
