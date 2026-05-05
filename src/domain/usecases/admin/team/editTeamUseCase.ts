import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { ICreateTeam } from 'shared/interfaces/common/admin/team';

import AdminRepository from '../../../../data/repository/admin';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class EditTeamUseCase implements IUseCaseObservable {
  private adminRepository: AdminRepository;

  constructor(
    private payload: ICreateTeam,
    private name: string
  ) {
    this.adminRepository = new AdminRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.adminRepository.editTeam(this.payload, this.name);
}
