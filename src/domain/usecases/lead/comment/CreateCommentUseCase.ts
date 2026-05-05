import LeadRepository from 'data/repository/lead';
import { IUseCase } from 'shared/interfaces/common/usecase';

export default class GetLeadCommentUseCase implements IUseCase {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  validate = (): boolean => {
    return true;
  };

  execute = (payload: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      this.leadRepository
        .createComment(payload)
        .then((res: any) => {
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  };
}
