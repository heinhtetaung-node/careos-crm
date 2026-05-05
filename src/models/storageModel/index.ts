import { getUnixTime } from 'utils/datetime';

export default class StorageModel<T> {
  /**
   *
   * Timestamp
   * @type {number}
   * @memberof StorageModel
   */
  createdAt: number;

  /**
   * In seconds
   * @property validationTime
   * @type {number}
   * @memberof StorageModel
   */
  validationTime: number;

  data?: T;

  constructor(data?: T) {
    this.createdAt = getUnixTime(new Date());
    this.validationTime = 30 * 24 * 60 * 60;
    this.data = data;
  }
}
