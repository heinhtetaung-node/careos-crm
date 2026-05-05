import _getValue from 'lodash/get';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IPayLoad } from 'data/gateway/api/helper/queryString.helper';
import LeadDetail from 'data/repository/leadDetail/cloud';
import { customForkJoin } from 'shared/helper/operator';

const clearSub$ = new Subject();
const getAddressForkJoin = (address: IPayLoad) => {
  const province = _getValue(address, 'province');
  const district = _getValue(address, 'district');
  const subDistrict = _getValue(address, 'subDistrict');
  return customForkJoin(
    LeadDetail.getProvinceById(`${province}`),
    LeadDetail.getDistrictById({
      province,
      districts: district,
    }),
    LeadDetail.getSubDistrictById({
      province,
      districts: district,
      subDistrict,
    })
  ).pipe(takeUntil(clearSub$));
};

export default { getAddressForkJoin };
