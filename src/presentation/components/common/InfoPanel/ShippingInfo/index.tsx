/* eslint-disable arrow-body-style */
import i18next from 'i18next';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Subscription } from 'rxjs';

import { useUpdatePolicyMutation } from 'data/slices/orderPolicySlice';
import { useGetTransactionFeeQuery } from 'data/slices/transactionSlice';
import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { updateOrder } from 'presentation/redux/actions/order';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import GetAddressHelper from 'shared/helper/getAddress';
import { capitalizeFirstLetter } from 'shared/helper/utilities';
import {
  validationShippingPerson,
  validationShippingCompany,
} from 'shared/validators/InfoPanel';
import { satangToBaht } from 'utils/currency';

import {
  shippingMandatoryPolicyNum,
  shippingVoluntaryPolicyNum,
  shippingTrackingNum,
  shippingAddressItems,
  shippingVoluntaryPolicyNumReadOnly,
  shippingMandatoryPolicyNumReadOnly,
  shippingAddressItemsReadOnly,
  isPolicyModify,
  shipmentFeeReadOnly,
} from './ShippingInfoPanel.helper';

import { getPolicyId } from '../Insurance/Insurance.helper';

interface ShippingProps {
  hasMultiplePolicies?: boolean | null;
  insuranceCategory?: string | null;
  order: any;
  policy: any;
  paymentType: string;
}
interface Address {
  province: any;
  district: any;
  subDistrict: any;
}

interface DeliveryData {
  shipmentStatus: string;
  statusUpdateTime: string;
}

export interface ShippingDelivery {
  deliveredByCourier?: DeliveryData;
  trackingNumber?: string;
}

function ShippingInfo({
  shippingInfoData,
  orderId,
  policyId,
  policyShipmentData,
  isEditable = false,
}: {
  shippingInfoData: ShippingProps | undefined;
  policyShipmentData?: ShippingDelivery | null;
  orderId?: string;
  policyId?: string;
  isEditable?: boolean;
}) {
  const [policyType, setPolicyType] = React.useState('personal');
  const dispatch = useDispatch();
  const lang = capitalizeFirstLetter(i18next.language);
  const [policyState, setPolicyState] = React.useState({
    policyNumber: shippingInfoData?.policy?.policyNumber,
    trackingNumber: policyShipmentData?.trackingNumber,
  });
  const orderData = shippingInfoData?.order;
  const orderShippingInfo =
    orderData?.data?.policyHolder?.shippingAddress ??
    orderData?.data?.policyHolder?.policyAddress; // if shipping address is not present copy from policy address
  const orderPolicy = shippingInfoData?.policy;
  const isVoluntary = shippingInfoData?.insuranceCategory === 'VOLUNTARY';
  const order = useAppSelector((state) => state.order?.payload);
  const { data: transactionSnapshot } = useGetTransactionFeeQuery(
    order.payment,
    {
      skip: !order.payment,
    }
  );
  const [address, setAddress] = React.useState<Address | null>();
  let shippingAddressSub: Subscription;

  React.useEffect(() => {
    if (shippingInfoData && orderShippingInfo?.addressType) {
      setPolicyType(orderShippingInfo?.addressType);
      if (isEditable) return;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      shippingAddressSub = GetAddressHelper.getAddressForkJoin({
        province: orderShippingInfo?.province ?? '',
        district: orderShippingInfo?.district ?? '',
        subDistrict: orderShippingInfo?.subDistrict ?? '',
      }).subscribe((res: any) => {
        const shippingInfoAddress: Address = {
          province: null,
          district: null,
          subDistrict: null,
        };
        if (res) {
          const [province, disctrict, subDistrict] = res;
          shippingInfoAddress.province = province;
          shippingInfoAddress.district = disctrict;
          shippingInfoAddress.subDistrict = subDistrict;
        }
        setAddress(shippingInfoAddress);
      });
    }
  }, [shippingInfoData]);

  React.useEffect(() => {
    return () => {
      if (shippingAddressSub) {
        shippingAddressSub.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [
    updatePolicy,
    {
      isUninitialized,
      isSuccess: updateSuccess,
      data,
      error: updateErrorObject,
    },
  ] = useUpdatePolicyMutation();

  React.useEffect(() => {
    if (!isUninitialized && updateSuccess && data) {
      setPolicyState({
        ...policyState,
        policyNumber: data?.policyNumber,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, updateSuccess, data]);

  React.useEffect(() => {
    if (!isUninitialized && updateErrorObject) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateInsuranceFailed', {
            message: updateErrorObject.toString(),
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else if (!isUninitialized && updateSuccess) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateInsuranceSuccessfully'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUninitialized, updateSuccess, updateErrorObject]);

  const items: IFormikControllerProps[] = [
    shipmentFeeReadOnly,
    ...[isVoluntary ? shippingVoluntaryPolicyNum : shippingMandatoryPolicyNum],
    ...[shippingTrackingNum],
    ...shippingAddressItems,
  ];

  const itemsReadonly: IFormikControllerProps[] = [
    shipmentFeeReadOnly,
    ...[
      isVoluntary
        ? shippingVoluntaryPolicyNumReadOnly
        : shippingMandatoryPolicyNumReadOnly,
    ],
    ...[shippingTrackingNum],
    ...shippingAddressItemsReadOnly,
  ];

  const shippingInitialVals = {
    ...(isVoluntary
      ? {
          voluntaryPolicyNum: orderPolicy?.policyNumber ?? '',
        }
      : {
          mandatoryPolicyNum: orderPolicy?.policyNumber ?? '',
        }),
    shipmentFee: satangToBaht(
      transactionSnapshot?.priceSummary?.shipmentFee ?? ''
    ).toString(),
    trackingNum: policyShipmentData?.trackingNumber ?? '',
    address: orderShippingInfo?.address ?? '',
    province: isEditable
      ? orderShippingInfo?.province
      : address?.province[`name${lang}`] || '',
    districts: [],
    district: isEditable
      ? orderShippingInfo?.district
      : address?.district[`name${lang}`] || '',
    subDistricts: [],
    subDistrict: isEditable
      ? orderShippingInfo?.subDistrict
      : address?.subDistrict[`name${lang}`] || '',
    postcode: orderShippingInfo?.postCode ?? '',
  };

  const handleOrderUpdate = (values: any) => {
    const policyModify = isPolicyModify(isVoluntary, values, policyState);
    if (shippingInfoData && orderId && policyId && policyModify) {
      updatePolicy({
        policyNumber: isVoluntary
          ? values?.voluntaryPolicyNum
          : values?.mandatoryPolicyNum,
        orderId,
        policyId: getPolicyId(shippingInfoData?.policy.name),
      });
    }

    const shippingAddress = order?.data?.policyHolder?.shippingAddress;
    const policyHolder = order?.data?.policyHolder;
    const formatedOrder = {
      name: order.name,
      data: {
        ...order.data,
        oicCode: order?.data?.oicCode ?? '',
        numberOfSeats: order?.data?.numberOfSeats ?? 0,
        policyHolder: {
          ...policyHolder,
          policyAddress: {
            ...policyHolder.policyAddress,
            isShippingAddress: false,
          },
          shippingAddress: {
            address: values.address,
            addressType: shippingAddress?.addressType ?? 'personal',
            district: values.district,
            fullName:
              shippingAddress?.fullName ??
              `${policyHolder.firstName} ${policyHolder.lastName}`,
            postCode: values.postcode,
            province: values.province,
            subDistrict: values.subDistrict,
          },
        },
      },
    };
    dispatch(updateOrder(formatedOrder));
  };
  return (
    <FormikWrapper
      title="text.shippingInfo"
      items={isEditable ? items : itemsReadonly}
      initialValues={shippingInitialVals}
      validationSchema={
        policyType === 'personal'
          ? validationShippingPerson
          : validationShippingCompany
      }
      handleUpdate={handleOrderUpdate}
    />
  );
}

export default ShippingInfo;
