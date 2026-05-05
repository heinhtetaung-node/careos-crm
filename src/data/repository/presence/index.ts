import PresenceCloud from './cloud';

import { IPresence } from '../../../shared/interfaces/common/admin/user';

export default class PresenceRepository {
  /**
   *
   * @param user
   * @returns {Promise<ResponseModel<any>>}
   */
  updatePresence = (payload?: IPresence, userName?: string) => {
    return PresenceCloud.updatePresence(payload, userName);
  };
}
