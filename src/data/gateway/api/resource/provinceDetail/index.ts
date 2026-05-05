import * as CONSTANTS from 'shared/constants';
import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';

const getProvince = (payload: number): IResource => ({
  Type: Type.Public,
  Path: `/api/${CONSTANTS.apiEndpoint.provinceDetailEndpoint}/${payload}`,
});

export default {
  getProvince,
};
