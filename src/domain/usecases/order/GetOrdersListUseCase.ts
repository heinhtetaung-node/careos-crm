import OrderDetailRepository from 'data/repository/orderDetail';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class GetOrdersListUseCase implements IUseCaseObservable {
  private orderDetailRepository: OrderDetailRepository;

  constructor() {
    this.orderDetailRepository = new OrderDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (payload, productName) =>
    this.orderDetailRepository.getOrdersList(payload, productName);
}
