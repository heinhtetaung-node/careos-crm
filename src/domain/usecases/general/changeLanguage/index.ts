import LanguageRepository from '../../../../data/repository/language';
import ResponseModel from '../../../../models/response';
import { IUseCase } from '../../../../shared/interfaces/common/usecase';

export default class ChangeLanguageUseCase implements IUseCase {
  private languageRepository: LanguageRepository;

  constructor(private lang: string) {
    this.languageRepository = new LanguageRepository();
  }

  validate = (): boolean => {
    return true;
  };

  execute = (): Promise<ResponseModel<string>> => {
    return new Promise((resolve, reject) => {
      this.languageRepository
        .setLanguageStorage(this.lang)
        .then((response: any) => {
          const data = response && response.data;

          if (data) {
            resolve(data);
          } else {
            reject(ResponseModel.createError(500, 'Customer token is null'));
          }
        })
        .catch((error: any) => {
          resolve(error);
        });
    });
  };
}
