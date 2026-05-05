import sortAndFilter from '@careos/sorting-filtering';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';

import { useGetPackagesQuery } from 'data/slices/packageListing';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetProductSelector } from 'presentation/redux/selectors/lead';
import { getLanguage } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { generateErrorMessage } from 'shared/helper/ErrorHelper';
import { formatBahtToSatang } from 'utils/currency';

import { FilterInterface } from '../PackageFilter/interface';
import transformPackages from '../packageTransformation';

export type TransformedPackageType = ReturnType<
  typeof transformPackages
>[number];

function useTransformedPackages(leadId: string, filterValues: FilterInterface) {
  const currentLanguage = getLanguage();

  const currencyConvertedFilterValues = {
    ...filterValues,
    ...(filterValues.price
      ? {
          price: {
            min: BigInt(filterValues.price.min) * BigInt(100),
            max: BigInt(filterValues.price.max) * BigInt(100),
          },
        }
      : {}),
    ...(filterValues.sumInsured
      ? {
          sumInsured: {
            min: BigInt(filterValues.sumInsured.min) * BigInt(100),
            max: BigInt(filterValues.sumInsured.max) * BigInt(100),
          },
        }
      : {}),
  };
  const dispatch = useDispatch();

  const product = useGetProductSelector();
  const { data, isLoading, error, isFetching } = useGetPackagesQuery(
    {
      productType: product,
      leadId,
      insuranceKind: filterValues.insuranceCategory,
      installment: 1,
      paymentOption: 'FULL_PAYMENT',
      ...(!filterValues.isDefaultSumInsured && {
        sumInsuredMin: formatBahtToSatang(filterValues.sumInsured?.min),
        sumInsuredMax: formatBahtToSatang(filterValues.sumInsured?.max),
      }),
    },
    {
      skip: _isEmpty(filterValues),
    }
  );

  if (error) {
    const errorResponse: any = _get(error, 'data.details');
    const errorArray = errorResponse?.map((response: any) =>
      generateErrorMessage(response)
    );

    dispatch(
      showSnackBar({
        isOpen: true,
        message: errorArray,
        status: CONSTANTS.snackBarConfig.type.error,
      })
    );
  }

  const { normalPackages, customPackages } = sortAndFilter(
    'motor',
    (data?.packages ?? []) as any,
    currencyConvertedFilterValues as any,
    false,
    false,
    currentLanguage as any
  );

  return {
    normalPackages: transformPackages(normalPackages, filterValues),
    customPackages: transformPackages(customPackages as any, filterValues),
    rawPackages: data?.packages ?? [],
    carDetails: data?.carDetails ?? {},
    status: {
      isLoading,
      isFetching,
    },
  };
}

export default useTransformedPackages;
