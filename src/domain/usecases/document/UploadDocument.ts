import { Observable } from 'rxjs';

import DocumentRepository from 'data/repository/document';
import ResponseModel from 'models/response';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class UploadDocument implements IUseCaseObservable {
  private documentRepository: DocumentRepository;

  constructor(private body: any) {
    this.documentRepository = new DocumentRepository();
  }

  validate = (): boolean => true;

  execute = (): Observable<ResponseModel<string>> =>
    this.documentRepository.uploadDocument(this.body);
}
