import { useEffect, useState } from 'react';
import { getI18n } from 'react-i18next';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { IInsurerState } from 'presentation/redux/reducers/orders/all';
import { getString } from 'presentation/theme/localization';
import { satangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';
import { Questions } from '../config';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';

export function getI18InsurerName(insurer?: IInsurerState) {
  if (!insurer) return null;
  const { displayName, shortnameEn, displayNameTh, shortnameTh } = insurer;
  const language = getI18n()?.language || 'en';
  if (language === 'th') return shortnameTh || displayNameTh;
  return shortnameEn || displayName;
}

export default function usePackagesInfo(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const dispatch = useAppDispatch();
  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data || []
  );

  const [packageInfo, setPackageInfo] = useState({});

  const items = resp?.items;

  useEffect(() => {
    dispatch(getInsurersAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (!isFetching) {
      const packages = items?.map(({ item, healthPackage: pkg }) => {
        return {
          [Questions.COVERAGE]: pkg?.displayNameTh,
          [Questions.COVERAGE_VOLUNTARY_PACKAGE]: getString(
            `healthPackageDetail.categories.${pkg?.category}`
          ),
          [Questions.POLICYSTARTDATE]: format(
            new Date(item.policyStartDate),
            'dd/MM/yyyy'
          ),
          [Questions.PREMIUM]: formatCoverage(
            satangToBaht(item?.grossPremium ?? 0)
          ),
        };
      });

      setPackageInfo(
        packages?.reduce(
          (prev: any, curr: any) => Object.assign(prev, curr),
          {}
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, items, insurers]);

  return packageInfo;
}
