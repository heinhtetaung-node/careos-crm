import ProvinceDetailRepository from 'data/repository/provinceDetail';
import { executeWithoutPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class GetProvinceUseCase implements IUseCaseObservable {
  private provinceDetailRepository: ProvinceDetailRepository;

  constructor(private payload: any) {
    this.provinceDetailRepository = new ProvinceDetailRepository();
  }

  validate = (): boolean => true;

  execute: executeWithoutPayloadFn = () =>
    this.provinceDetailRepository.getProvince(this.payload);
}
