import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';
import { items, readOnlyItems } from 'shared/helper/VehicleInfoPanel';
import { format } from 'utils/datetime';

function getVehicleProvince(
  carLicensePlate: string,
  registeredProvince: number
) {
  if (carLicensePlate?.split(' ').length > 1) {
    return carLicensePlate?.split(' ')[1];
  }
  const province = provinceAbbreviationCollection().find(
    (item) => item.oic === registeredProvince
  );
  return province?.abbreviation ?? '';
}

function getItemConfig(
  isEditable: boolean,
  carLicensePlate: string,
  registeredProvince: number
) {
  let fields;
  // Check if carLicensePlate = redplate
  // if true, do not display carLicensePlate field
  if (isEditable) {
    // for editable section
    const carLicense: IFormikControllerProps = {
      name: 'carLicensePlate',
      title: 'leadDetailFields.licensePlate',
      fieldType: 'license',
      display: true,
      dataTestId: 'vehicle-car-license-plate',
      province: getVehicleProvince(carLicensePlate, registeredProvince),
    };
    fields = [...items.slice(0, 4), carLicense, ...items.slice(4)];
  }

  if (!isEditable) {
    // readonly section
    const carLicense: IFormikControllerProps = {
      name: 'carLicensePlate',
      title: 'leadDetailFields.licensePlate',
      fieldType: 'license',
      display: true,
      isReadOnly: true,
      dataTestId: 'vehicle-car-license-plate',
      province: getVehicleProvince(carLicensePlate, registeredProvince),
    };
    fields = [
      ...readOnlyItems.slice(0, 4),
      carLicense,
      ...readOnlyItems.slice(4),
    ];
  }
  return fields;
}

function formatUpdatePayload(values: any, order: any) {
  const {
    typeOfVehicle,
    province,
    carName,
    redPlate,
    dashCam,
    drivingPurpose,
    firstDriverDOB,
    secondDriverDOB,
    modelYear,
    carModified,
    ...rest
  } = values;
  const { oicCode = '', numberOfSeats = 0, ...orderData } = order.data;
  // Build Patch payload with required fields

  return {
    name: order.name,
    data: {
      ...orderData,
      ...rest,
      oicCode,
      numberOfSeats,
      firstDriverDOB: firstDriverDOB
        ? format(new Date(firstDriverDOB), 'yyyy-MM-dd')
        : undefined,
      secondDriverDOB: secondDriverDOB
        ? format(new Date(secondDriverDOB), 'yyyy-MM-dd')
        : undefined,
      carModified: carModified === 'Yes',
      carDashCam: dashCam === 'Yes',
      carUsageType: drivingPurpose === 'Personal' ? 'personal' : 'commercial',
    },
  };
}

export default {
  getItemConfig,
  formatUpdatePayload,
};
