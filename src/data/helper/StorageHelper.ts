import { add, getUnixTime, isAfter } from 'utils/datetime';

import StorageModel from '../../models/storageModel/index';

export default class StorageHelper {
  /**
   * @description Check stored data is valid or not
   * @param timeUnit Default is seconds
   * @static
   * @memberof StorageHelper
   */
  static isStoredDataValid = (
    storageModel: StorageModel<any>,
    timeUnit?: 'seconds' | 'minutes' | 'hours' | 'days'
  ): any => {
    const _timeUnit = timeUnit || 'seconds';
    const createdAt = getUnixTime(storageModel.createdAt);
    const { validationTime } = storageModel;
    const now = new Date();
    return isAfter(add(createdAt, { [_timeUnit]: validationTime }), now);
  };
}
