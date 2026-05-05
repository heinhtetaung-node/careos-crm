/* eslint-disable no-param-reassign */
import _getValue from 'lodash/get';
import _omit from 'lodash/omit';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import { updateOrder } from 'presentation/redux/actions/order';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { getTitle, titleOptionsFull } from 'shared/helper/selectOptions';
import {
  personalValidation,
  companyValidation,
} from 'shared/validators/InfoPanel';
import { format, isValid } from 'utils/datetime';

import PolicyHolderHelper from './PolicyHolder.helper';

interface PolicyHolder {
  communicationLanguage: string;
  companyName?: string;
  isCompany: boolean;
  isCustomer: boolean;
  dateOfBirth: string;
  firstName: string;
  gender: string;
  lastName: string;
  nationalID?: string;
  policyAddress: any;
  title: string;
  companyTaxId?: string;
}
interface Props {
  readonly isEditable?: boolean;
  readonly policyHolder: PolicyHolder;
}

const getDOB = (policyHolder = '', customer = '', isCustomer = false) => {
  if (isCustomer) {
    return customer && isValid(new Date(customer))
      ? format(new Date(customer), 'dd/MM/yyyy')
      : null;
  }
  return policyHolder && isValid(new Date(policyHolder))
    ? format(new Date(policyHolder), 'dd/MM/yyyy')
    : null;
};

function PolicyHolder({ isEditable = false, policyHolder }: Props) {
  const dispatch = useDispatch();
  const { orderId } = useParams();

  const order = useAppSelector((state) => state.order?.payload);

  const { data: orderDetail } = useGetOrderItemsQuery(
    {
      orderId: orderId!,
    },
    {
      skip: !orderId,
    }
  );

  const isCompany = policyHolder?.isCompany;
  const customerInsuredPerson = policyHolder?.isCustomer;
  const currentPolicyHolder = customerInsuredPerson
    ? orderDetail?.customer.customer
    : policyHolder;
  const personIntialValues = {
    customerIsNotInsuredPerson: getString('qc.customerIsNotInsuredPerson'),
    customerIsInsuredPerson: getString('qc.customerIsInsuredPerson'),
    title: getTitle(policyHolder?.title, isEditable),
    firstName: currentPolicyHolder?.firstName ?? '',
    lastName: currentPolicyHolder?.lastName ?? '',
    gender: PolicyHolderHelper.getGender(policyHolder?.gender, isEditable),
    dateOfBirth: getDOB(
      policyHolder?.dateOfBirth,
      orderDetail?.customer.customer?.dateOfBirth,
      customerInsuredPerson
    ),
    age: PolicyHolderHelper.getAge(
      currentPolicyHolder?.dateOfBirth &&
        isValid(new Date(currentPolicyHolder?.dateOfBirth))
        ? format(new Date(currentPolicyHolder.dateOfBirth), 'yyyy-MM-dd')
        : ''
    ),
    idType: PolicyHolderHelper.getDocumentType(order?.data?.idType, isEditable),
    idNumber: order.data?.idNumber ?? '',
  };

  const companyIntialValues = {
    policyCompanyHeader: getString('qc.policyHolderIsCompany'),
    companyName: policyHolder?.companyName || '',
    taxId: policyHolder?.companyTaxId ?? '',
  };

  const handleOrderUpdate = (values: any) => {
    const data = _omit(values, ['districts', 'subDistricts']);

    // Omit this field from patch payload
    const orderData = _omit(order.data, ['isOfflinePayment']);
    const orderPolicyHolder = _getValue(orderData, 'policyHolder');
    const orderPolicyAddress = _getValue(
      orderData.policyHolder,
      'policyAddress'
    );

    const personalData = {
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender === 'Male' ? 'm' : 'f',
      dateOfBirth: isValid(new Date(data.dateOfBirth))
        ? format(new Date(data.dateOfBirth), 'yyyy-MM-dd')
        : null,
    };

    const companyData = {
      companyName: data.companyName,
      companyTaxId: data.taxId,
    };
    // Build Patch payload with required fields
    const formatedOrder = {
      name: order.name,
      data: {
        ...orderData,
        oicCode: order?.data?.oicCode ?? '',
        numberOfSeats: order?.data?.numberOfSeats ?? 0,
        idNumber: data?.idNumber ?? '',
        idType: data?.idType ?? 'NationalID',
        policyHolder: {
          ...orderPolicyHolder,
          ...(!isCompany ? personalData : companyData),
          communicationLanguage:
            order?.data?.policyHolder?.communicationLanguage,
          policyAddress: {
            ...orderPolicyAddress,
            fullName:
              orderPolicyAddress?.fullName ??
              `${data.firstName} ${data.lastName}`,
            taxId: orderPolicyAddress.taxId ?? '',
          },
        },
      },
    };

    dispatch(updateOrder(formatedOrder));
  };

  const getItems = () => {
    let { personItems, readOnlyPersonItems } = PolicyHolderHelper;
    const { companyItems, readOnlyItems } = PolicyHolderHelper;
    const excludePersonConfig = customerInsuredPerson
      ? 'customerIsNotInsuredPerson'
      : 'customerIsInsuredPerson';

    const newPersonItems = personItems.filter(
      (item) => item.name !== excludePersonConfig
    );
    const newReadOnlyPersonItems = readOnlyPersonItems.filter(
      (item) => item.name !== excludePersonConfig
    );
    personItems = newPersonItems.map((item) => {
      const isKeyMatch = ['dateOfBirth', 'firstName', 'lastName'].includes(
        item.name
      );
      if (isKeyMatch && customerInsuredPerson) {
        item.isReadOnly = true;
      }
      if (item.name === 'title') {
        item.options = titleOptionsFull;
      }
      return item;
    });

    readOnlyPersonItems = newReadOnlyPersonItems;
    if (isEditable) {
      return !isCompany ? personItems : companyItems;
    }

    const companyItemsReadOnly = companyItems.map((companyItem) => ({
      ...companyItem,
      isReadOnly: true,
    }));
    return !isCompany
      ? [...readOnlyPersonItems, ...readOnlyItems]
      : companyItemsReadOnly;
  };

  const getValidationSchema = () =>
    !isCompany ? personalValidation : companyValidation;

  return (
    <FormikWrapper
      title="order.policyholder"
      items={getItems()}
      initialValues={!isCompany ? personIntialValues : companyIntialValues}
      validationSchema={isEditable ? getValidationSchema() : null}
      handleUpdate={handleOrderUpdate}
    />
  );
}

export default PolicyHolder;
