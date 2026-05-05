import { ICreateUserAnotation } from 'shared/interfaces/common/admin/user';

export default class PresentationUserModel {
  name?: string;

  humanId?: string;

  role?: string;

  firstName?: string;

  lastName?: string;

  createBy?: string;

  annotations?: ICreateUserAnotation;

  team?: string;

  constructor() {
    this.name = '';
    this.humanId = '';
    this.role = '';
    this.firstName = '';
    this.lastName = '';
    this.createBy = '';
    this.annotations = {
      daily_limit: '',
      score: '',
      total_limit: '',
    };
    this.team = '';
  }
}
