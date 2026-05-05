import i18next from 'i18next';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { updateOrder } from 'presentation/redux/actions/order';
import { getProvince } from 'presentation/redux/actions/provinceDetail';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { capitalizeFirstLetter } from 'shared/helper/utilities';
import { validationSchema } from 'shared/helper/VehicleInfoPanel';
import { format, isValid } from 'utils/datetime';

import VehicleHelper from './helper';

interface IProps {
  isEditable?: boolean;
}

function Vehicle({ isEditable = false }: Readonly<IProps>) {
  const { orderId } = useParams();
  const { data: orderData } = useGetOrderItemsQuery(
    { orderId: orderId! },
    { skip: !orderId }
  );
  const [vehicle, setVehicle] = React.useState<any>({});
  const dispatch = useDispatch();
  const lang = capitalizeFirstLetter(i18next.language);
  const order = useAppSelector((state) => state.order?.payload);
  const province = useAppSelector(
    (state) => state.provinceDetailReducer?.data || {}
  );
  const car = useAppSelector((state) => state.order?.payload?.car);

  const getData = () => {
    const { registeredProvince } = order?.data || {};
    if (registeredProvince && !province?.name) {
      dispatch(getProvince(registeredProvince));
    }
  };

  React.useEffect(() => {
    setVehicle({
      type: getString('lead.car'),
      carName: car?.displayName,
      modelYear: car?.year,
      redPlate: order?.data?.isRedPlate
        ? `${getString('text.yes')}`
        : `${getString('text.no')}`,
      carLicensePlate: order?.data?.carLicensePlate,
      chassisNumber: order?.data?.chassisNumber,
      engineNumber: order?.data?.engineNumber,
      vehicleColor: order?.data?.vehicleColor,
      drivingPurpose: getString(
        `text.${order?.data?.carUsageType || 'personal'}`
      ),
      dashCam: order?.data?.carDashCam
        ? `${getString('text.yes')}`
        : `${getString('text.no')}`,
      carModified: order?.data?.carModified
        ? `${getString('text.yes')}`
        : `${getString('text.no')}`,
      firstDriverName: order?.data?.firstDriverName,
      firstDriverDOB:
        order?.data?.firstDriverDOB &&
        isValid(new Date(order.data.firstDriverDOB))
          ? format(new Date(order.data.firstDriverDOB), 'dd/MM/yyyy')
          : null,
      firstDriverIdNumber: order?.data?.firstDriverIdNumber,
      firstDriverDrivingLicense: order?.data?.firstDriverDrivingLicense,
      secondDriverName: order?.data?.secondDriverName,
      secondDriverDOB: order?.data?.secondDriverDOB
        ? format(new Date(order.data.secondDriverDOB), 'dd/MM/yyyy')
        : null,
      secondDriverIdNumber: order?.data?.secondDriverIdNumber,
      secondDriverDrivingLicense: order?.data?.secondDriverDrivingLicense,
      engineSize: orderData?.car?.subModel?.engineSize ?? NaN,
      noOfDoor: orderData?.car?.subModel?.doors ?? NaN,
      noOfSeat: orderData?.order?.data?.numberOfSeats ?? NaN,
    });
    getData();
  }, [order, car, orderData]);

  const fieldItems = React.useMemo(
    () =>
      VehicleHelper.getItemConfig(
        isEditable,
        order?.data?.carLicensePlate ?? '',
        order?.data?.registeredProvince
      ),
    [vehicle, province]
  );

  const vehicleInitialValues = {
    typeOfVehicle: vehicle.type,
    carName: vehicle.carName,
    province: province[`name${lang}`],
    redPlate: vehicle.redPlate,
    carLicensePlate: vehicle.carLicensePlate?.split(' ')[0] ?? '',
    modelYear: vehicle.modelYear ?? '',
    chassisNumber: vehicle.chassisNumber ?? '',
    engineNumber: vehicle.engineNumber ?? '',
    vehicleColor: vehicle.vehicleColor ?? '',
    drivingPurpose: vehicle.drivingPurpose ?? '',
    dashCam: vehicle.dashCam,
    carModified: vehicle.carModified,
    firstDriverName: vehicle.firstDriverName ?? '',
    firstDriverDOB: vehicle.firstDriverDOB,
    firstDriverIdNumber: vehicle.firstDriverIdNumber,
    firstDriverDrivingLicense: vehicle.firstDriverDrivingLicense,
    secondDriverName: vehicle.secondDriverName ?? '',
    secondDriverDOB: vehicle.secondDriverDOB,
    secondDriverIdNumber: vehicle.secondDriverIdNumber,
    secondDriverDrivingLicense: vehicle.secondDriverDrivingLicense,
    engineSize: vehicle.engineSize ?? NaN,
    noOfDoor: vehicle.noOfDoor ?? NaN,
    noOfSeat: vehicle.noOfSeat ?? NaN,
  };

  const handleOrderUpdate = React.useCallback(
    (values: any) => {
      const formattedOrder = VehicleHelper.formatUpdatePayload(values, order);
      dispatch(updateOrder(formattedOrder));
    },
    [dispatch]
  );

  return (
    <FormikWrapper
      title="text.vehicle"
      items={fieldItems}
      initialValues={vehicleInitialValues}
      validationSchema={isEditable ? validationSchema : null}
      handleUpdate={handleOrderUpdate}
    />
  );
}

export default Vehicle;
