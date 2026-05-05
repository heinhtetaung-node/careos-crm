import SelectorRepository from '../../../../data/repository/typeSelector';
import { IUseCase } from '../../../../shared/interfaces/common/usecase';

export default class GetProductSelectorsUseCase implements IUseCase {
  private selectorRepository: SelectorRepository;

  constructor() {
    this.selectorRepository = new SelectorRepository();
  }

  validate = (): boolean => {
    return true;
  };

  execute = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.selectorRepository.getProductSelectors().then((res) => {
        resolve(res);
      });
    });
  };
}
