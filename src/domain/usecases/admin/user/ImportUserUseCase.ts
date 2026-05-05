import { ProductTypeFilter } from '../../../../config/TypeFilter';
import UsersRepository from 'data/repository/admin/user';
import { executeWithPayloadFn } from 'shared/interfaces/common';

import { UserRole } from '../../../../mock-data/AdminUser.mock';
import { IImportUserPayload } from '../../../../shared/interfaces/common/admin/user';
import { IUseCaseObservable } from '../../../../shared/interfaces/common/usecase';

export default class ImportUserUseCase implements IUseCaseObservable {
  private userRepository: UsersRepository;

  constructor() {
    this.userRepository = new UsersRepository();
  }

  findProduct = (productName: string) =>
    (
      ProductTypeFilter.find(
        (item) =>
          item.title.toLowerCase() ===
          (productName ? productName.toLowerCase() : null)
      )?.id || ''
    ).toString();

  findRole = (roleName: string) => {
    const role = UserRole.find(
      (item) =>
        item.title.toLowerCase() === (roleName ? roleName.toLowerCase() : null)
    );
    return role?.value || '';
  };

  formatListUser = (users: any): IImportUserPayload[] => {
    const format: IImportUserPayload[] = users.map((item: any) => {
      const newItem: IImportUserPayload = {
        firstName: item['First Name'].trim(),
        lastName: item['Last Name'].trim(),
        agentScore: item['Agent Score'],
        userRole: this.findRole(item['User Role']),
        userName: item['User Name'].trim(),
        assignedProduct: this.findProduct(item['Assigned Product']).trim(),
        assignedTeam: item['Assigned Team'].trim(),
        dailyLeadLimit: item['Daily Lead Limit'],
        totalLeadLimit: item['Total Lead Limit'],
        userStatus: item['User Status'],
      };
      return newItem;
    });
    return format;
  };

  execute: executeWithPayloadFn = (users) => {
    const format = this.formatListUser(users);
    const payload = {
      userList: format,
    };
    return this.userRepository.importUser(payload);
  };
}
