import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showSnackBar } from 'presentation/redux/actions/ui';
import _get from 'lodash/get';
import _has from 'lodash/has';
import * as CONSTANTS from 'shared/constants';
import { getString } from 'presentation/theme/localization';
import { useLazyGetCarDataQuery } from 'data/slices/carSlice';
import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import { useGetSumInsuredRangeQuery } from 'data/slices/packageListing/api';

import {
  customCarData,
  formatCarInfo,
  ICarInfo,
} from '../../LeadDetailsPage/leadDetailsPage.helper';
import useUpdateCarData from 'presentation/components/CarInfoSection/EditableCarSection/useUpdateCarData';

export function getUniqueValues(
  data: { engineSize: number; doors: number }[],
  key: 'engineSize' | 'doors'
): { key: number; label: number; value: number }[] {
  if (!data?.length) return [];
  return Object.values(
    data.reduce(
      (acc, item) => {
        const value = item[key];
        if (!acc.seen.has(value)) {
          acc.seen.add(value);
          acc.uniqueValues.push({
            key: value,
            label: value,
            value,
          });
        }
        return acc;
      },
      {
        seen: new Set(),
        uniqueValues: [] as { key: number; label: number; value: number }[],
      }
    ).uniqueValues
  );
}

/**
 * When `onlyRedbookId` is set (e.g. filter sidebar), keep submodel options that have a Red Book id
 * or match the lead's current `carSubModelYear`; otherwise return options unchanged.
 */
export function resolveSubModelsForPackageListing(
  onlyRedbookId: boolean | undefined,
  options: any[] | undefined,
  leadCarSubModelYear: string | number | undefined
): any[] | undefined {
  if (!onlyRedbookId) {
    return options;
  }
  return options?.filter(
    (subModel: any) =>
      Boolean(subModel.redbookId) || subModel.value === leadCarSubModelYear
  );
}

const useGetInitialPackageValues = ({
  leadId,
  skip,
  onlyRedbookId,
}: {
  leadId: string;
  skip?: boolean;
  onlyRedbookId?: boolean;
}) => {
  const dispatch = useDispatch();
  const [carInfo, setCarInfo] = useState({});
  const [carGeneral, setCarGeneral] = useState({
    brand: '',
    model: '',
    year: 0,
    subModel: '',
    sumInsuredMax: 0,
    engineSize: null,
    noOfDoor: null,
    redbookId: null,
  });

  const [getCarData] = useLazyGetCarDataQuery();

  // Queries
  const {
    data: lead,
    isLoading: leadLoading,
    refetch,
  } = useGetLeadByIDQuery(leadId);

  const carSubModelYear = useMemo(
    () => lead?.data?.carSubModelYear ?? undefined,
    [lead?.data]
  );

  const {
    data: sumInsuredMinMax,
    isError,
    isLoading: sumInsuredLoading,
    error,
  } = useGetSumInsuredRangeQuery(carSubModelYear ?? skipToken, {
    skip: skip || !carSubModelYear,
  });

  // Fetch car data
  const fetchCarData = useCallback(async () => {
    if (!lead?.data) return;

    const carResponse = await getCarData({
      pathParam: `brands/-/models/-/submodels/-/years/${carSubModelYear}:getUniqueCars`,
      queryParam: {},
      field: '',
    });

    if (!carResponse.isError) {
      const resCopy = carResponse.data[0];
      const formattedCarData = customCarData(resCopy, carSubModelYear ?? '');
      setCarGeneral(formattedCarData);
    }
  }, [getCarData, carSubModelYear]);

  useEffect(() => {
    if (carSubModelYear) {
      fetchCarData();
    }
  }, [carSubModelYear, fetchCarData]);

  useEffect(() => {
    if (carGeneral && lead) {
      const tempCarInfo = formatCarInfo(lead, carGeneral);
      setCarInfo(tempCarInfo);
    }
  }, [carGeneral, JSON.stringify(lead)]);

  // Update car state
  const {
    carState,
    dataSchema,
    isLoading: isGettingCarInfo,
  } = useUpdateCarData(carInfo as ICarInfo, () => '');

  // Loading and error states
  const isLoading = useMemo(
    () => leadLoading || sumInsuredLoading || isGettingCarInfo,
    [leadLoading, sumInsuredLoading, isGettingCarInfo]
  );

  const hasError = useMemo(
    () =>
      !sumInsuredLoading &&
      isError &&
      error &&
      _has(error, 'status') &&
      _get(error, 'status') === 404,
    [sumInsuredLoading, isError, error]
  );

  // Handle errors
  useEffect(() => {
    if (hasError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errors.sumInsured'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  }, [hasError, dispatch]);

  return {
    lead,
    carInfo: carState,
    sumInsuredMinMax,
    provinces: dataSchema.registeredProvince?.inputProps.options,
    years: dataSchema.year?.inputProps.options,
    brands: dataSchema.brand?.inputProps.options,
    models: dataSchema.model?.inputProps.options,
    subModels: resolveSubModelsForPackageListing(
      onlyRedbookId,
      dataSchema.carSubModelYear?.inputProps.options,
      lead?.data?.carSubModelYear
    ),
    noOfDoors: getUniqueValues(
      dataSchema.noOfDoors?.inputProps?.options,
      'doors'
    ),
    engineSizes: getUniqueValues(
      dataSchema.noOfDoors?.inputProps?.options,
      'engineSize'
    ),
    isLoading,
    updateCarGeneral: ({ value, name }: any) => {
      setCarGeneral((prev) => ({ ...prev, [name]: value }));
    },
    refetchLead: refetch,
  };
};

export default useGetInitialPackageValues;
