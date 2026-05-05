import _keyBy from 'lodash/keyBy';
import { useState, useEffect, useMemo } from 'react';
import { getI18n } from 'react-i18next';

import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { IInsurerState } from 'presentation/redux/reducers/orders/all';
import { getString } from 'presentation/theme/localization';
import { MotoTypes, PackageType } from 'shared/constants/orderType';
import { satangToBaht } from 'utils/currency';
import { format, isValid } from 'utils/datetime';

import { formatCoverage } from '../helpers/utils';
import { getPackageTypeLabelFromOrderData } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';

export const insuranceType = {
  [MotoTypes.MOTOR_TYPE_COMPULSORY]: getString('qc.mandatory'),
  [MotoTypes.MOTOR_TYPE_1]: getString('qc.type1'),
  [MotoTypes.MOTOR_TYPE_2_PLUS]: getString('qc.type2Plus'),
  [MotoTypes.MOTOR_TYPE_3_PLUS]: getString('qc.type3Plus'),
  [MotoTypes.MOTOR_TYPE_2]: getString('qc.type2'),
  [MotoTypes.MOTOR_TYPE_3]: getString('qc.type3'),
} as any;

export const packageType = {
  [PackageType.RENEWAL]: getString('qc.renewal'),
  [PackageType.STANDARD]: getString('qc.standard'),
  [PackageType.TRANSFER_CODE]: getString('qc.transferCode'),
};

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
  const isInsurersFetching = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.isFetching
  );
  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data || []
  );

  const [packageInfo, setPackageInfo] = useState({});

  const items = resp?.items;

  useEffect(() => {
    dispatch(getInsurersAll({ pageSize: 1000 }));
  }, [dispatch]);

  const insurersMap = useMemo(() => {
    if (!isInsurersFetching) {
      return _keyBy(insurers, 'name');
    }
    return {};
  }, [isInsurersFetching, insurers]);

  useEffect(() => {
    if (!isFetching) {
      const packages = items?.map(({ item, package: pkg }) => {
        if (item.motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY) {
          return {
            [item.motorItemType]: {
              [Questions.COVERAGE]: `${
                insuranceType[item.motorItemType]
              }, ${getI18InsurerName(insurersMap[item.insurer])}`,
              [Questions.POLICYSTARTDATE]:
                item?.policyStartDate && isValid(new Date(item.policyStartDate))
                  ? format(new Date(item.policyStartDate), 'dd/MM/yyyy')
                  : '',
              [Questions.PREMIUM]: formatCoverage(
                satangToBaht(item?.grossPremium ?? 0)
              ),
            },
          };
        }
        const packageTypeLabel = getPackageTypeLabelFromOrderData(
          pkg?.packageType,
          pkg?.source
        );
        return {
          [item.motorItemType]: {
            [Questions.COVERAGE]: `${
              insuranceType[item.motorItemType]
            }, ${getI18InsurerName(insurersMap[item.insurer])}`,
            packageTypeLabel,
            [Questions.COVERAGE_VOLUNTARY_PACKAGE]: pkg?.packageType
              ? packageType[pkg.packageType as PackageType]
              : packageType.STANDARD, // blank mean standard package
            [Questions.COVERAGE_VOLUNTARY_SUM_INSURED]: formatCoverage(
              satangToBaht(item?.sumInsured ?? 0)
            ),
            [Questions.POLICYSTARTDATE]:
              item?.policyStartDate && isValid(new Date(item.policyStartDate))
                ? format(new Date(item.policyStartDate), 'dd/MM/yyyy')
                : '',
            [Questions.PREMIUM]: formatCoverage(
              satangToBaht(item?.grossPremium ?? 0)
            ),
          },
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
