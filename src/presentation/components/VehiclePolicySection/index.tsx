/* eslint-disable react-hooks/exhaustive-deps */
import i18next from 'i18next';
import React, { useState, useEffect } from 'react';

import InfoPanel from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel';
import { IField } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/type';
import { updateOrder } from 'presentation/redux/actions/order';
import { getProvince } from 'presentation/redux/actions/provinceDetail';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

import { checkFieldBoolean, validateData } from './helper';

import { getString } from '../../theme/localization';

interface IEditError {
  field: string;
  msg: string;
}

interface IUpdateOrder {
  name: string;
  value: any;
}

interface IVehicleInfoSection {
  isEditable?: boolean;
}

/**
 * @deprecated
 */
function VehicleInfoSection({ isEditable = false }: IVehicleInfoSection) {
  const [vehicle, setVehicle] = useState<any>({});
  const [error, setError] = useState<IEditError>({ field: '', msg: '' });
  const dispatch = useAppDispatch();
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

  const dataSchema: IField[] = [
    {
      titleString: getString('text.typeOfVehicle'),
      value: getString('lead.car'),
      type: 'field',
    },
    {
      value: vehicle.carName || '',
      type: 'subTitle',
    },
    {
      titleString: getString('package.provinceSearchLabel'),
      value: province[`name${lang}`] ?? '',
      type: 'field',
      name: 'province',
    },
    {
      titleString: getString('leadDetailFields.redPlate'),
      value: checkFieldBoolean(vehicle?.isRedPlate),
      type: 'field',
    },
    {
      titleString: getString('text.licensePlate'),
      value: vehicle.carLicensePlate || '',
      type: 'license',
      isEditable,
      name: 'carLicensePlate',
      optional: vehicle.registeredProvince,
    },
    {
      titleString: getString('text.modelYear'),
      value: vehicle.modelYear,
      type: 'field',
      testId: 'vs-model-year',
    },
    {
      titleString: getString('text.chassisNumber'),
      value: vehicle?.chassisNumber || '',
      type: 'text',
      isEditable,
      name: 'chassisNumber',
    },
    {
      titleString: getString('leadDetailFields.engineNumber'),
      value: vehicle?.engineNumber || '',
      type: 'text',
      isEditable,
      name: 'engineNumber',
    },
    {
      titleString: getString('leadDetailFields.drivingPurpose'),
      value: getString(`text.${vehicle.carUsageType}`),
      type: 'field',
      name: 'drivingPurpose',
    },
    {
      titleString: getString('leadDetailFields.dashCam'),
      value: checkFieldBoolean(vehicle.carDashCam),
      type: 'field',
      name: 'dashCam',
    },
    {
      titleString: getString('text.customVehicle'),
      value: checkFieldBoolean(vehicle.carModified),
      type: 'field',
      name: 'customVehicle',
    },
    {
      titleString: getString('leadDetailFields.firstDriverName'),
      value: vehicle?.firstDriverName || '',
      type: 'text',
      isEditable,
      name: 'firstDriverName',
    },
    {
      titleString: getString('leadDetailFields.firstDriverDOB'),
      value: vehicle.firstDriverDOB || '',
      type: 'datef',
      isEditable,
      name: 'firstDriverDOB',
      optional: 'birthdate',
    },
    {
      titleString: getString('leadDetailFields.secondDriverName'),
      value: vehicle?.secondDriverName || '',
      type: 'text',
      isEditable,
      name: 'secondDriverName',
    },
    {
      titleString: getString('leadDetailFields.secondDriverDOB'),
      value: vehicle.secondDriverDOB || '',
      type: 'datef',
      isEditable,
      name: 'secondDriverDOB',
      optional: 'birthdate',
    },
  ];

  useEffect(() => {
    setVehicle((state: any) => ({
      ...state,
      ...order?.data,
      carName: car?.displayName,
      modelYear: car?.year,
    }));
    getData();
  }, [order, car]);

  const setErrorField = (name?: string, msg?: string) => {
    setError({
      field: name || '',
      msg: msg || '',
    });
  };

  const onUpdateOrder = (payload: IUpdateOrder) => {
    setErrorField();
    if (validateData(payload) && payload.value.length) {
      if (order?.name && payload.value !== order.data[payload.name]) {
        const formatedOrder = {
          name: order.name,
          data: {
            ...order.data,
            [payload.name]: payload.value,
          },
        };
        dispatch(updateOrder(formatedOrder));
      }
    } else if (!validateData(payload) && payload.value.length) {
      setErrorField(payload.name, 'Please enter a valid value');
    } else {
      const field = dataSchema.find(
        (item) => item.name && item.name === payload.name
      );
      const fieldName = field?.titleString?.toLowerCase();
      setErrorField(
        payload.name,
        fieldName
          ? `Please enter a value for ${fieldName}`
          : 'Please enter a value'
      );
    }
  };

  return (
    <InfoPanel
      dataSchema={dataSchema as IField[]}
      title={getString('text.vehicle')}
      handleUpdateOrder={onUpdateOrder}
      error={error}
    />
  );
}

export default VehicleInfoSection;
