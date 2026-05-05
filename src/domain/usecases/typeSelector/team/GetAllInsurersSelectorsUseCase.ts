import { executeWithoutPayloadFn } from 'shared/interfaces/common';

import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetAllInsurersSelectorsUseCase
  implements IUseCaseObservable
{
  private selectorRepository: SelectorRepository;

  constructor(private payload: any) {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.selectorRepository.getAllInsurersSelectors(this.payload);
}
