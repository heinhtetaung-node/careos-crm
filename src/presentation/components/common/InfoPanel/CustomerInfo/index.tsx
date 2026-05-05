import _find from 'lodash/find';
import _omit from 'lodash/omit';
import * as React from 'react';

import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';
import Loading from 'Loading';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { useUpdateCustomer } from 'presentation/pages/car-insurance/LeadDetailsPage/Hooks/useUpdate';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import {
  items,
  readOnlyItems as readOnly,
  emailPhoneFields,
  validationSchema,
} from 'shared/helper/CustomerInfoPanel';
import { format, isValid } from 'utils/datetime';

import { languageConvert } from './helper';

interface CustomerInfoProps {
  isEditable?: boolean;
  showPhoneAndEmail?: boolean;
  customerInfo?: Record<string, any>;
  textFieldError?: boolean;
}

function CustomerInfo({
  isEditable = false,
  customerInfo,
  showPhoneAndEmail = false,
  textFieldError = true,
}: CustomerInfoProps) {
  const order = useAppSelector((state) => state.order?.payload);
  const commLanguageKey =
    order?.data?.policyHolder?.communicationLanguage ?? null;
  const [updateCustomer] = useUpdateCustomer();
  const [updatePolicyHolder] = useUpdateOrderDataMutation();
  const [updateOrder] = useUpdateOrderDataMutation();

  if (!customerInfo) {
    return <Loading />;
  }

  let readOnlyItems = readOnly;

  const {
    customer: customerDetail = {},
    emails = [],
    phones = [],
  } = customerInfo;
  const primaryPhone = _find(phones, ['name', customerDetail.primaryPhoneId]);
  const recentEmail = emails[0];

  const customerInitialValues: Record<string, string | undefined> = {
    firstName: customerDetail?.firstName ?? '-',
    lastName: customerDetail?.lastName ?? '-',
    gender:
      customerDetail?.gender === 'GENDER_UNSPECIFIED'
        ? ''
        : customerDetail?.gender,
    dateOfBirth: customerDetail?.dateOfBirth
      ? format(new Date(customerDetail.dateOfBirth), 'dd/MM/yyyy')
      : undefined,
    communicationLanguage: !isEditable
      ? languageConvert(commLanguageKey)
      : commLanguageKey,
  };

  if (showPhoneAndEmail) {
    customerInitialValues.email = recentEmail?.email ?? '-';
    customerInitialValues.phone = primaryPhone?.phone ?? '-';
    readOnlyItems = [
      ...readOnly.slice(0, 2),
      ...emailPhoneFields,
      ...readOnly.slice(2),
    ];
  }

  const updateCustomerAndPolicyHolder = (values: any) => {
    let customerPayload = _omit(values, 'communicationLanguage', 'age');
    customerPayload = {
      ...customerPayload,
      dateOfBirth: isValid(values.dateOfBirth)
        ? new Date(new Date(values.dateOfBirth).setUTCHours(24, 0, 0, 0))
        : undefined,
    };
    updateCustomer({
      customerId: customerInfo?.customer?.name,
      payload: customerPayload,
    });
    if (order?.data?.policyHolder?.isCustomer) {
      const payloads = [
        {
          op: 'add',
          path: 'data/policyHolder/firstName',
          value: values?.firstName,
        },
        {
          op: 'add',
          path: 'data/policyHolder/lastName',
          value: values?.lastName,
        },
        {
          op: 'add',
          path: 'data/policyHolder/gender',
          value: values?.gender?.toLowerCase(),
        },
      ];
      if (isValid(values.dateOfBirth)) {
        payloads.push({
          op: 'add',
          path: 'data/policyHolder/dateOfBirth',
          value: format(new Date(values.dateOfBirth), 'yyyy-MM-dd'),
        });
      }
      updatePolicyHolder({
        orderId: order.name.split('/')[1],
        payload: payloads,
      });
    }
  };

  const handleOrderUpdate = (values: any) => {
    if (
      values.communicationLanguage !==
      customerInitialValues?.communicationLanguage
    ) {
      updateOrder({
        orderId: order.name.split('/')[1],
        payload: [
          {
            op: 'add',
            path: 'data/policyHolder/communicationLanguage',
            value: values?.communicationLanguage,
          },
        ],
      });
      updateCustomerAndPolicyHolder(values);
    } else {
      updateCustomerAndPolicyHolder(values);
    }
  };

  return (
    <FormikWrapper
      title="order.customerInfo"
      items={isEditable ? items : readOnlyItems}
      initialValues={customerInitialValues}
      validationSchema={isEditable ? validationSchema : null}
      handleUpdate={handleOrderUpdate}
      textFieldError={textFieldError}
    />
  );
}

export default CustomerInfo;
