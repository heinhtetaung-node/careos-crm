import ProvinceDetailCloud from './cloud';

export default class ProvinceDetailRepository {
  getProvince = (payload: { [key: string]: number | string | boolean }) => {
    return ProvinceDetailCloud.getProvince(payload);
  };
}
