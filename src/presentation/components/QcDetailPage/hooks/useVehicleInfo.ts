import _camelCase from 'lodash/camelCase';
import _capitalize from 'lodash/capitalize';
import { useState, useEffect } from 'react';
import { getI18n } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { useGetCarDataQuery } from 'data/slices/carSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getProvince } from 'presentation/redux/actions/provinceDetail';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { format, isValid } from 'utils/datetime';

interface Driver {
  name?: string;
  dob?: string;
  drivingLicense?: string;
  idNumber?: string;
}

export function getI18Province({
  nameEn,
  nameTh,
}: Record<string, string> = {}) {
  const language = getI18n()?.language || 'en';
  if (language === 'th') return nameTh;
  return nameEn;
}

const carUsageType: Record<string, string> = {
  personal: getString('text.personal'),
  commercial: getString('text.commercial'),
};

export default function useVehicleInfo(
  resp: OrderDataResponse | undefined, // resp value can be undefined but it is not optional parameter
  isFetching: boolean
) {
  const { isLoading: isCarLoading, data: [carDetail] = [] } =
    useGetCarDataQuery(
      {
        pathParam: `brands/-/models/-/submodels/-/years/${resp?.order.data.carSubModelYear}`,
      },
      { skip: !resp }
    );

  const [vehicleInfo, setVehicleInfo] = useState({});
  const province = useAppSelector(
    (state) => state?.provinceDetailReducer?.data
  );
  const dispatch = useDispatch();
  const order = resp?.order;
  const data = order?.data;
  const car = resp?.car;

  const drivers: Driver[] = [
    {
      name: data?.firstDriverName ?? '-',
      dob: data?.firstDriverDOB ?? '',
      drivingLicense: data?.firstDriverDrivingLicense ?? '-',
      idNumber: data?.firstDriverIdNumber ?? '-',
    },
    {
      name: data?.secondDriverName ?? '-',
      dob: data?.secondDriverDOB ?? '',
      drivingLicense: data?.secondDriverDrivingLicense ?? '-',
      idNumber: data?.secondDriverIdNumber ?? '-',
    },
  ].map((d: any) => ({
    ...d,
    dob:
      d?.dob && isValid(new Date(d.dob))
        ? format(new Date(d.dob), 'dd/MM/yyyy')
        : '-',
  }));

  useEffect(() => {
    if (!isFetching) {
      dispatch(getProvince(resp?.order?.data?.registeredProvince));
    }
  }, [isFetching, resp, dispatch]);

  useEffect(() => {
    if (!isFetching && !isCarLoading) {
      const isElectricType = carDetail?.fuelType === 'Electric';
      const isEngineSizeExist = !!car?.subModel.engineSize;
      const showEngineSize = !isElectricType && isEngineSizeExist;
      let model = `${car?.brand.displayName} ${car?.model.displayName} ${car?.carYear}, ${car?.subModel.displayName}`;
      model += showEngineSize ? `(${car?.subModel.engineSize}CC)` : '';
      const firstDriver = `${drivers[0].name}, ${drivers[0].dob}, ${drivers[0].idNumber}, ${drivers[0].drivingLicense}`;
      const secondDriver = `${drivers[1].name}, ${drivers[1].dob}, ${drivers[1].idNumber}, ${drivers[1].drivingLicense}`;
      const vehicle = {
        [Questions.DRIVER_ONE_NAME_AGE]: firstDriver,
        [Questions.DRIVER_TWO_NAME_AGE]: secondDriver,
        [Questions.VEHICLE_MODEL]: model,
        [Questions.DASH_CAM]: data?.carDashCam
          ? getString('text.yes')
          : getString('text.no'),
        [Questions.VEHICLE_MODIFICATIONS]: data?.carModified
          ? getString('text.yes')
          : getString('text.no'),
        [Questions.VEHICLE_LICENSE]: `${
          data?.carLicensePlate ? data?.carLicensePlate?.replace('-', ' ') : '-'
        }, ${getI18Province(province)}`,
        [Questions.CHASSIS_NUM]: data?.chassisNumber,
        [Questions.VEHICLE_COLOR]: data?.vehicleColor?.length
          ? data.vehicleColor
              ?.map((color: string) => {
                const language = getI18n()?.language || 'en';
                if (language === 'th')
                  return getString(`order.vehicleColor.${_camelCase(color)}`);
                return _capitalize(color);
              })
              ?.join(', ')
          : '-',
        [Questions.ENGINE_NUM]: data?.engineNumber,
        [Questions.OIC_DRIVING_PURPOSE]: [
          data?.oicCode,
          carUsageType[data?.carUsageType as string] ?? data?.carUsageType,
        ]?.join(', '),
        [Questions.VEHICLE_MODIFICATIONS_VALUE]: '-',
      };
      setVehicleInfo(vehicle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, isCarLoading, order, data, car, province, carDetail]);

  return vehicleInfo;
}
