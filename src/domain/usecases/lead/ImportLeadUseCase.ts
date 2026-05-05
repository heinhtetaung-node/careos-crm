import LanguageRepository from '../../../data/repository/language';
import { IUseCase } from '../../../shared/interfaces/common/usecase';

export default class ImportLeadUseCase implements IUseCase {
  private languageRepository: LanguageRepository;

  constructor() {
    this.languageRepository = new LanguageRepository();
  }

  validate = (): boolean => {
    return true;
  };

  execute = (): Promise<string> => {
    return new Promise((resolve) => {
      resolve('no data');
    });
  };
}
