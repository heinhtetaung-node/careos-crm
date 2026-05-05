import { Observable } from 'rxjs';

import PresenceRepository from '../../../data/repository/presence';
import { IPresence } from '../../../shared/interfaces/common/admin/user';
import { IUseCaseObservable } from '../../../shared/interfaces/common/usecase';

export default class UpdatePresenceUseCase implements IUseCaseObservable {
  private presenceRepository: PresenceRepository;

  constructor() {
    this.presenceRepository = new PresenceRepository();
  }

  validate = (): boolean => true;

  execute = (
    payload?: IPresence,
    userName?: string
  ): Observable<{ data: IPresence }> =>
    this.presenceRepository.updatePresence(payload, userName);
}
