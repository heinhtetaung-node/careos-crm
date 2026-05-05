import TeamsRepository from 'data/repository/admin/team';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetTeamsUseCase implements IUseCaseObservable {
  private teamRepository: TeamsRepository;

  constructor() {
    this.teamRepository = new TeamsRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (payload) => {
    const searchPayload = {
      pageSize: payload.pageSize,
      pageToken: payload.pageToken,
      orderBy: payload?.orderBy || [],
      filter: payload?.filter,
    };
    return this.teamRepository.setTeamCloud(searchPayload);
  };
}
