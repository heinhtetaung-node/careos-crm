import _keyBy from 'lodash/keyBy';
import { useState, useEffect, useMemo } from 'react';

import { ItemElement } from 'data/slices/orderPolicySlice/interface';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import {
  MotoTypes,
  PackageType,
  CarRepairType,
} from 'shared/constants/orderType';
import { satangToBaht } from 'utils/currency';

import {
  packageType,
  insuranceType,
  getI18InsurerName,
} from './usePackagesInfo';

import { calculateAndFormatDiscounts, formatCoverage } from '../helpers/utils';

const carRepairType = {
  [CarRepairType.GARAGE]: getString('qc.garage'),
  [CarRepairType.DEALER]: getString('qc.dealer'),
  [CarRepairType.CAR_REPAIR_TYPES_UNSPECIFIED]: '-',
};

export default function usePackageDetails(
  items: ItemElement[],
  isFetching: boolean
): Partial<Record<MotoTypes, any>> {
  const [packageDetailsInfo, setPackageDetailsInfo] = useState({});
  const dispatch = useAppDispatch();
  const isInsurersFetching = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.isFetching
  ); // refactor me!
  const insurers = useAppSelector(
    (state) => state.ordersReducer?.insurersAllReducer.data || []
  ); // refactor me!

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
      const packageDetails = items?.map(({ item, package: pkg, discounts }) => {
        if (item.motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY) {
          return {
            [item.motorItemType]: {
              insurer: getI18InsurerName(insurersMap[item.insurer]),
              motorItemType: item?.motorItemType,
              insuranceType: insuranceType[item?.motorItemType],
              discount: calculateAndFormatDiscounts((discounts as any) ?? []),
              premium: formatCoverage(satangToBaht(item?.grossPremium ?? 0)),
            },
          };
        }
        return {
          [item.motorItemType]: {
            insurer: getI18InsurerName(insurersMap[item.insurer]),
            motorItemType: item?.motorItemType,
            packageName: pkg?.displayName ? pkg?.displayName : '-',
            sumInsured: formatCoverage(satangToBaht(item?.sumInsured ?? 0)),
            insuranceType: insuranceType[item?.motorItemType],
            packageType:
              packageType[pkg?.packageType as PackageType] ??
              packageType.STANDARD,
            discount: calculateAndFormatDiscounts((discounts as any) ?? []),
            premium: formatCoverage(satangToBaht(item?.grossPremium ?? 0)),
            deductibleAmount:
              formatCoverage(satangToBaht(pkg?.deductibleAmount)) ?? '-',
            fireTheftCoverage: formatCoverage(
              satangToBaht(pkg?.fireTheftCoverage)
            ),
            floodCoverage: formatCoverage(satangToBaht(pkg?.floodCoverage)),
            carRepairType:
              carRepairType[pkg?.carRepairType as CarRepairType] ?? '',
            liabilityPropertyCoverage: formatCoverage(
              satangToBaht(pkg?.liabilityPropertyCoverage)
            ),
            liabilityPerPersonCoverage: formatCoverage(
              satangToBaht(pkg?.liabilityPerPersonCoverage)
            ),
            liabilityPerAccidentCoverage: formatCoverage(
              satangToBaht(pkg?.liabilityPerAccidentCoverage)
            ),
            personalAccidentCoverage: formatCoverage(
              satangToBaht(pkg?.personalAccidentCoverage)
            ),
            medicalExpensesCoverage: formatCoverage(
              satangToBaht(pkg?.medicalExpensesCoverage)
            ),
            bailBondCoverage: formatCoverage(
              satangToBaht(pkg?.bailBondCoverage)
            ),
          },
        };
      });

      setPackageDetailsInfo(
        packageDetails?.reduce((prev, curr) => ({ ...prev, ...curr }), {})
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, items, insurers]);

  return packageDetailsInfo;
}
