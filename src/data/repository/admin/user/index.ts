import UsersCloud from './cloud';

export default class UsersRepository {
  getUserCloud = (payload: { [key: string]: number | string | boolean }) => {
    return UsersCloud.getUsers(payload);
  };

  getTeamByUser = (payload: string) => {
    return UsersCloud.getTeamByUser(payload);
  };

  getTeamInfo = (payload: string) => {
    return UsersCloud.getTeamInfo(payload);
  };

  getUser = (id: string) => UsersCloud.getUser(id);

  importUser = (users: any) => UsersCloud.importUser(users);

  lookUpUser = () => UsersCloud.lookUpUser();

  lookUpUserByRole = (role: string) => UsersCloud.lookUpUserByRole(role);
}
