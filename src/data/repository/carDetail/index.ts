import CarDetailCloud from './cloud';

export default class CarDetailRepository {
  getCarDetail = (payload: { [key: string]: number | string | boolean }) => {
    return CarDetailCloud.getCarDetail(payload);
  };
}
