import Grid from '@material-ui/core/Grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Spinner from 'presentation/components/Spinner';
import { useLeadUpdaterFromOrder } from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import useUpdateCarData from 'presentation/components/CarInfoSection/EditableCarSection/useUpdateCarData';
import { CAR_ROWS } from 'presentation/components/CarInfoSection/EditableCarSection/interface';
import { useLazyGetCarDataQuery } from 'data/slices/carSlice';
import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import {
  customCarData,
  ICarInfo,
} from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';

interface VehicleModelFormProps {
  data: OrderDataResponse | undefined;
  setSubmitButtonToggle: React.Dispatch<React.SetStateAction<boolean>>;
  handleModalToggle: () => void;
  handleLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const vehicleModelFields = [
  CAR_ROWS.CAR_YEAR,
  CAR_ROWS.CAR_BRAND,
  CAR_ROWS.CAR_MODEL,
  CAR_ROWS.SUB_MODEL,
];

function getNumericId(resourceName?: string, segment?: string) {
  if (!resourceName || !segment) return null;
  const parts = resourceName.split('/');
  const segmentIndex = parts.indexOf(segment);
  const value = segmentIndex >= 0 ? parts[segmentIndex + 1] : undefined;

  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
export function toNumberOrNull(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isNaN(v) ? null : v;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return null;
    const n = Number.parseInt(trimmed, 10);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === 'bigint') {
    const n = Number.parseInt(v.toString(), 10);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

interface OrderDataWithVehicle {
  carSubModelYear?: number | string;
  carModified?: boolean;
  carDashCam?: boolean;
  carUsageType?: string;
  carRegisteredSeats?: number;
  registeredProvince?: number;
  carLicensePlate?: string;
  chassisNumber?: string;
  vehicleIdNumber?: number | string;
  vehicleColor?: string[];
}
function mapOrderToCarInfo(data: OrderDataResponse | undefined): ICarInfo {
  const d = data?.order?.data as OrderDataWithVehicle | undefined;
  return {
    year: data?.car?.carYear ?? null,
    brand: getNumericId(data?.car?.brand?.name, 'brands'),
    model: getNumericId(data?.car?.model?.name, 'models'),
    subModel: getNumericId(data?.car?.subModel?.name, 'submodels'),
    carSubModelYear: toNumberOrNull(d?.carSubModelYear),
    fuelType: data?.car?.subModel?.type ?? null,
    transmission: data?.car?.subModel?.transmissionType ?? null,
    engineSize: data?.car?.subModel?.engineSize ?? null,
    noOfDoors: data?.car?.subModel?.doors ?? null,
    cabType: data?.car?.subModel?.cabType ?? null,
    carModified: d?.carModified,
    carDashCam: d?.carDashCam,
    carUsageType: d?.carUsageType as 'personal' | 'commercial' | undefined,
    carRegisteredSeats: d?.carRegisteredSeats,
    registeredProvince: d?.registeredProvince ?? null,
    redPlate: d?.carLicensePlate === 'redplate',
    carLicensePlate: d?.carLicensePlate,
    chassisNumber: d?.chassisNumber,
    vehicleIdNumber: d?.vehicleIdNumber,
    carColor: d?.vehicleColor,
    isVan: data?.car?.model?.isVan,
  };
}

export default function VehicleModelForm({
  data,
  setSubmitButtonToggle,
  handleModalToggle,
  handleLoading,
  onSuccess,
}: Readonly<VehicleModelFormProps>) {
  const { orderId } = useParams<{ orderId: string }>();
  const { updateLead } = useLeadUpdaterFromOrder(data);
  const [getCarData, { isLoading: isInitialCarInfoLoading }] =
    useLazyGetCarDataQuery();
  const baseCarInfo = useMemo(() => mapOrderToCarInfo(data), [data]);
  const [initialCarInfo, setInitialCarInfo] = useState(baseCarInfo);
  const [selectedCarSubModelYear, setSelectedCarSubModelYear] = useState(
    baseCarInfo.carSubModelYear
  );
  const noopSave = useCallback(() => {}, []);
  const {
    isLoading: isCarLoading,
    dataSchema,
    carState,
    handleAutocompleteChange,
  } = useUpdateCarData(initialCarInfo, noopSave);
  const [
    updateOrder,
    { isLoading: isUpdatingOrder, isSuccess: isUpdateSuccess },
  ] = useUpdateOrderDataMutation();

  const isLoading = isInitialCarInfoLoading || isCarLoading || isUpdatingOrder;
  useEffect(() => {
    setInitialCarInfo(baseCarInfo);
  }, [baseCarInfo]);

  useEffect(() => {
    async function hydrateCarInfoFromSubModelYear() {
      const carSubModelYear = data?.order?.data?.carSubModelYear;
      if (
        carSubModelYear == null ||
        carSubModelYear?.toString() === '' ||
        data?.car
      )
        return;
      const response = await getCarData({
        pathParam: `brands/-/models/-/submodels/-/years/${carSubModelYear}:getUniqueCars`,
        queryParam: {},
        field: '',
      });
      if (
        response.isError ||
        !Array.isArray(response.data) ||
        !response.data[0]
      )
        return;
      const formattedCarData = customCarData(response.data[0], carSubModelYear);
      const carInfo = response.data[0]?.car?.[0];
      const subModelId = getNumericId(carInfo?.name, 'submodels');
      const yearNum = toNumberOrNull(carSubModelYear);

      setInitialCarInfo((currentState) => ({
        ...currentState,
        year: formattedCarData.year ?? currentState.year,
        brand: formattedCarData.brand ?? currentState.brand,
        model: formattedCarData.model ?? currentState.model,
        subModel: subModelId ?? currentState.subModel,
        carSubModelYear: yearNum ?? currentState.carSubModelYear,
        fuelType: formattedCarData.fuelType ?? currentState.fuelType,
        transmission:
          formattedCarData.transmissionType ?? currentState.transmission,
        engineSize: formattedCarData.engineSize ?? currentState.engineSize,
        noOfDoors: formattedCarData.noOfDoor ?? currentState.noOfDoors,
        cabType: formattedCarData.cabType ?? currentState.cabType,
        isVan: formattedCarData.isVan ?? currentState.isVan,
      }));
    }
    hydrateCarInfoFromSubModelYear();
  }, [data, getCarData]);
  useEffect(() => {
    handleLoading(isLoading);
  }, [handleLoading, isLoading]);
  useEffect(() => {
    setSelectedCarSubModelYear(initialCarInfo.carSubModelYear);
  }, [initialCarInfo.carSubModelYear]);
  useEffect(() => {
    setSubmitButtonToggle(!selectedCarSubModelYear);
  }, [selectedCarSubModelYear, setSubmitButtonToggle]);
  useEffect(() => {
    if (isUpdateSuccess) {
      onSuccess?.();
      handleModalToggle();
    }
  }, [handleModalToggle, isUpdateSuccess, onSuccess]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedCarSubModelYear) {
        return;
      }
      await updateLead('/carSubModelYear', selectedCarSubModelYear);
      updateOrder({
        orderId: orderId!,
        payload: [
          {
            op: 'add',
            path: 'data/carSubModelYear',
            value: selectedCarSubModelYear,
          },
        ],
      });
    },
    [orderId, selectedCarSubModelYear, updateLead, updateOrder]
  );
  const handleVehicleModelChange = useCallback(
    (payload: any, name: string) => {
      if (name === CAR_ROWS.SUB_MODEL) {
        setSelectedCarSubModelYear(payload?.selections?.value ?? null);
        return;
      }
      setSelectedCarSubModelYear(null);
      handleAutocompleteChange(payload, name);
    },
    [handleAutocompleteChange]
  );
  return (
    <form
      id="update-data-myself"
      data-testid="update-vehicle-model-form"
      onSubmit={handleSubmit}
    >
      {isCarLoading ? (
        <Grid container justifyContent="center">
          <Spinner />
        </Grid>
      ) : (
        <Grid container>
          {vehicleModelFields.map((fieldName) => {
            const config = dataSchema?.[fieldName];
            if (!config) {
              return null;
            }
            const { InputComponent, inputProps } = config;
            const { name, isDisabled, ...rest } = inputProps as Record<
              string,
              any
            >;
            return (
              <Grid item xs={12} key={fieldName}>
                <InputComponent
                  name={name}
                  {...rest}
                  value={
                    name === CAR_ROWS.SUB_MODEL
                      ? (selectedCarSubModelYear ?? '')
                      : (carState?.[name] ?? '')
                  }
                  options={inputProps.options}
                  handleUpdate={(payload: any) =>
                    handleVehicleModelChange(payload, name)
                  }
                  isDisabled={isDisabled}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </form>
  );
}
