import { newShipmentMethodOptions } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

import { NewShippingMethods, ShippingMethods } from './orderType';

export const shippingMapping = {
  [ShippingMethods.COURIER]: getString('qc.kerry'),
  [ShippingMethods.EMAIL]: getString('qc.deliverByEmail'),
  [ShippingMethods.IN_PERSON]: getString('qc.inPerson'),
};

export const getShippingOption = (option: ShippingMethods) =>
  getString(shippingMapping[option]);

export const getShippingMethodsOptions = () =>
  [
    ShippingMethods.COURIER,
    ShippingMethods.EMAIL,
    ShippingMethods.IN_PERSON,
  ].map((method) => ({
    title: getString(shippingMapping[method]),
    value: method,
  }));

export const newShippingMapping = {
  [NewShippingMethods.DIGITAL_DELIVERY]: getString('qc.digitalDelivery'),
  [NewShippingMethods.STANDARD_DELIVERY]: getString('qc.standardDelivery'),
  [NewShippingMethods.EXPRESS_DELIVERY]: getString('qc.expressDelivery'),
  [NewShippingMethods.EXPRESS_DELIVERY_DASHCAM]: getString(
    'qc.expressDeliveryDashcam'
  ),
};

export const shipmentMethod = {
  [NewShippingMethods.DIGITAL_DELIVERY]: getString('qc.email'),
  [NewShippingMethods.STANDARD_DELIVERY]: getString('qc.standardDelivery'),
  [NewShippingMethods.EXPRESS_DELIVERY]: getString('qc.expressDelivery'),
};

export const getNewShippingMethodsOptions = () =>
  [
    NewShippingMethods.DIGITAL_DELIVERY,
    NewShippingMethods.STANDARD_DELIVERY,
    NewShippingMethods.EXPRESS_DELIVERY,
    NewShippingMethods.EXPRESS_DELIVERY_DASHCAM,
  ].map((method) => ({
    title: getString(newShippingMapping[method]),
    value:
      newShipmentMethodOptions().find((i) => i.name === method)?.method ?? '',
  }));
