import * as CONSTANTS from 'shared/constants';
import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';

const getCarDetail = (payload: number): IResource => ({
  Type: Type.Nest,
  Path: `/${CONSTANTS.apiEndpoint.carDetailEndpoint}/${payload}`,
});

export default {
  getCarDetail,
};
