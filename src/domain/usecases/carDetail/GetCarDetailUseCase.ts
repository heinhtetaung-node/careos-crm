import CarDetailRepository from 'data/repository/carDetail';
import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class GetCarDetailUseCase implements IUseCaseObservable {
  private carDetailRepository: CarDetailRepository;

  constructor(private payload: any) {
    this.carDetailRepository = new CarDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.carDetailRepository.getCarDetail(this.payload);
}
