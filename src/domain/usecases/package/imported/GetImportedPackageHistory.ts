import PackageRepository from 'data/repository/package';

import { executeWithPayloadFn } from '../../../../shared/interfaces/common';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class GetImportedPackageHistoryUseCase
  implements IUseCaseObservable
{
  private packageRepository: PackageRepository;

  constructor() {
    this.packageRepository = new PackageRepository();
  }

  validate = (): boolean => true;

  execute: executeWithPayloadFn = (payload, productName) =>
    this.packageRepository.getImportedPackageHistory(payload, productName);
}
