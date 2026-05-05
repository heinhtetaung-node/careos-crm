import { pluck } from 'rxjs/operators';

import * as CONSTANTS from '../../../../shared/constants';
import ApiGateway from '../../../gateway/api';
import Type from '../../../gateway/api/type';
import getConfig from '../../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const getCarBrandLookup = () => {
  const getCarBrandResource = {
    Type: Type.Public,
    Path: `/${CONSTANTS.apiUrl.leadDetail.getCarGeneral}/brands?pageSize=200`,
  };
  return apiGateway
    .doGetAjaxRequest(getCarBrandResource)
    .pipe(pluck('data', 'brands'));
};

export default {
  getCarBrandLookup,
};
