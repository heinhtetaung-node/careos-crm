import { Observable } from 'rxjs';

import AdminRepository from 'data/repository/admin';
import { ICreateTeam } from 'shared/interfaces/common/admin/team';

import ResponseModel from '../../../../models/response';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class CreateAdminTeamUseCase implements IUseCaseObservable {
  private adminRepository: AdminRepository;

  constructor(private body: ICreateTeam) {
    this.adminRepository = new AdminRepository();
  }

  validate = (): boolean => true;

  execute = (): Observable<ResponseModel<string>> =>
    this.adminRepository.createAdminTeam(this.body);
}
