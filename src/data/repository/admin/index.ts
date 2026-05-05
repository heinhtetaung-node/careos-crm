import { ICreateTeam } from 'shared/interfaces/common/admin/team';
import {
  IHandleTeamMember,
  ICreateUser,
} from 'shared/interfaces/common/admin/user';

import AdminCloud from './cloud';

export default class AdminRepository {
  /**
   *
   * @returns {Promise<ResponseModel<any>>}
   * @param payload
   */
  createUser = (payload: ICreateUser) => {
    return AdminCloud.createUser(payload);
  };

  addUserToTeam = (payload: IHandleTeamMember) => {
    return AdminCloud.addUserToTeam(payload);
  };

  createAdminTeam = (body: any) => {
    return AdminCloud.createAdminTeam(body);
  };

  editUser = (payload: ICreateUser, name: string) => {
    return AdminCloud.editUser(payload, name);
  };

  editTeam = (payload: ICreateTeam, name: string) => {
    return AdminCloud.editTeam(payload, name);
  };

  deleteMembership = (payload: string) => {
    return AdminCloud.deleteMembership(payload);
  };

  deleteUser = (payload: string) => {
    return AdminCloud.deleteUser(payload);
  };

  unDeleteUser = (payload: string) => {
    return AdminCloud.unDeleteUser(payload);
  };

  moveUserToTeam = (payload: IHandleTeamMember) => {
    return AdminCloud.moveUserToTeam(payload);
  };

  /**
   *
   * @returns {Promise<ResponseModel<string>>}
   */
}
