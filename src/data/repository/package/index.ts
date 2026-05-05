import PackageCloud from './cloud';

export default class PackageRepository {
  /**
   *
   * @returns {Promise<ResponseModel<any>>}
   */

  getImportedPackageHistory = (payload: any, productName: string) => {
    return PackageCloud.getImportedPackageHistory(payload, productName);
  };
}
