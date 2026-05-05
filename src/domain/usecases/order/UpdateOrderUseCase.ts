import OrderDetailRepository from 'data/repository/orderDetail';
import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class UpdateOrderUseCase implements IUseCaseObservable {
  private orderDetailRepository: OrderDetailRepository;

  constructor(private body: any) {
    this.orderDetailRepository = new OrderDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.orderDetailRepository.updateOrder(this.body);
}
