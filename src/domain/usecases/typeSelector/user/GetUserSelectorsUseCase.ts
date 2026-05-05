import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IGetUserList } from 'shared/interfaces/common/typeSelector/user';

import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetUserSelectorsUseCase implements IUseCaseObservable {
  private selectorRepository: SelectorRepository;

  constructor(private payload: IGetUserList) {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.selectorRepository.getUserSelectors(this.payload);
}
