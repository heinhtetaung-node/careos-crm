import PresentationUserModel from 'presentation/models/typeSelector/user';
import { IGetUserList } from 'shared/interfaces/common/typeSelector/user';

import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCase } from '../../../../shared/interfaces/common/usecase';

export default class GetUserSelectorsUseCase implements IUseCase {
  private selectorRepository: SelectorRepository;

  constructor(private payload: IGetUserList) {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => {
    return true;
  };

  execute = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.selectorRepository
        .getSupervisorUserSelectors(this.payload)
        .then((res: PresentationUserModel) => {
          resolve(res);
        });
    });
  };
}
