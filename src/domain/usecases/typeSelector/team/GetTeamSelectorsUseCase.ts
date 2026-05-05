import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IGetTeamList } from 'shared/interfaces/common/typeSelector/team';

import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetTeamSelectorsUseCase implements IUseCaseObservable {
  private selectorRepository: SelectorRepository;

  constructor(private payload: IGetTeamList) {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.selectorRepository.getTeamSelectors(this.payload);
}
