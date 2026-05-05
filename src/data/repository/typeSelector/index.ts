import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';
import { IGetTeamList } from 'shared/interfaces/common/typeSelector/team';
import { IGetUserList } from 'shared/interfaces/common/typeSelector/user';

import TypeSelectorCloud from './cloud';
import TypeSelectorStorage from './storage';

export default class SelectorRepository {
  /**
   *
   * @param user
   * @returns {Promise<ResponseModel<any>>}
   */
  getProductSelectors = () => {
    return TypeSelectorStorage.getProducts();
  };
  /**
   *
   * @returns {Promise<ResponseModel<string>>}
   */

  getLeadTypeSelectors = () => {
    return TypeSelectorStorage.getLeadTypes();
  };

  /**
   *
   * @returns {Promise<ResponseModel<string>>}
   */
  getTeamSelectors = (payload: IGetTeamList) => {
    return TypeSelectorCloud.getTeams(payload);
  };

  getAllTeamsSelectors = (payload: IGetTeamList) => {
    return TypeSelectorCloud.getAllTeams(payload);
  };

  /**
   *
   * @returns {Promise<ResponseModel<string>>}
   */
  getUserSelectors = (payload: IGetUserList) => {
    return TypeSelectorCloud.getUsers(payload);
  };

  getManagerUserSelectors = (payload: IGetUserList) => {
    return TypeSelectorCloud.getUsers(payload);
  };

  getSupervisorUserSelectors = (payload: IGetUserList) => {
    return TypeSelectorCloud.getUsers(payload);
  };

  /**
   *
   * @returns {Promise<ResponseModel<string>>}
   */
  getRoleSelectors = (payload: IGetRoleSelector) => {
    return TypeSelectorCloud.getRoles(payload);
  };

  getTeamRoleSelectors = (payload: IGetRoleSelector) => {
    return TypeSelectorCloud.getTeamRoles(payload);
  };

  getAllInsurersSelectors = (payload: any) => {
    return TypeSelectorCloud.getAllInsurers(payload);
  };

  getTeamDetailSelectors = (payload: any) => {
    return TypeSelectorCloud.getTeamDetail(payload);
  };
}
