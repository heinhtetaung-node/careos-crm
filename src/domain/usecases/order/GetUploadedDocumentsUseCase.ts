import { Observable } from 'rxjs';

import OrderDetailRepository from 'data/repository/orderDetail';
import ResponseModel from 'models/response';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class GetUploadedDocumentsUseCase implements IUseCaseObservable {
  private orderDetailRepository: OrderDetailRepository;

  constructor(private body: string) {
    this.orderDetailRepository = new OrderDetailRepository();
  }

  validate = (): boolean => true;

  execute = (): Observable<ResponseModel<string>> =>
    this.orderDetailRepository.getUploadedDocuments(this.body);
}
