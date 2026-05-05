import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IHandleTeamMember } from 'shared/interfaces/common/admin/user';

import AdminRepository from '../../../../data/repository/admin';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class MoveUserToTeamUseCase implements IUseCaseObservable {
  private adminRepository: AdminRepository;

  constructor(private payload: IHandleTeamMember) {
    this.adminRepository = new AdminRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.adminRepository.moveUserToTeam(this.payload);
}
