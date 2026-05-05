import { initConfig } from '../../../../config';
import { IUseCase } from '../../../../shared/interfaces/common/usecase/index';

export default class AppInitUseCase implements IUseCase {
  execute = (): Promise<[]> => {
    return new Promise((resolve, reject) => {
      initConfig()
        .then(() => {
          resolve([]);
        })
        .catch(reject);
    });
  };
}
