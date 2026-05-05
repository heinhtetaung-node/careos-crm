import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';

import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetRoleSelectorsUseCase implements IUseCaseObservable {
  private selectorRepository: SelectorRepository;

  constructor(private payload: IGetRoleSelector) {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.selectorRepository.getRoleSelectors(this.payload);
}
