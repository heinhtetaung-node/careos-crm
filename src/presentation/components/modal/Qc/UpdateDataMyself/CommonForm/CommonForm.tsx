/* eslint-disable consistent-return */
import { FormikValues, useFormik } from 'formik';
import _find from 'lodash/find';
import _get from 'lodash/get';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFlags } from 'flagsmith/react';

import FeatureFlags from 'config/flagsmithConfig';

import { useGetAddressDataQuery } from 'data/slices/addressSlice';
import { useCreateCustomerEmailMutation } from 'data/slices/customerSlice';
import { useUpdatePolicyDataMutation } from 'data/slices/orderPolicySlice';
import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { ShippingMethods } from 'shared/constants/orderType';
import { format, formatISO } from 'utils/datetime';
import { useUpdateCustomer } from 'presentation/pages/car-insurance/LeadDetailsPage/Hooks/useUpdate';
import { useLeadUpdaterFromOrder } from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

import { optionsMapping, policyholderOptions, formatValue } from '../helper';
import { useFormStyles } from '../index.styles';
import Input from '../Input';
import { cleanEmptyKeys } from 'presentation/components/QcDetailPage/helpers/utils';
import { syncOrderDataPatchesToLead } from 'shared/helper/vehicleOrderLeadSync';

import {
  formatOicCodeForOrder,
  parseOicCodeForSelect,
} from '../oicCode.helper';

interface CommonFormProps {
  data: OrderDataResponse | undefined;
  optionsMap: Record<string, any>;
  fields: any[];
  setSubmitButtonToggle: React.Dispatch<React.SetStateAction<boolean>>;
  handleModalToggle: () => void;
  handleLoading: (laoding: boolean) => void;
  policyId?: string;
}

export default function CommonForm({
  data,
  optionsMap,
  fields,
  setSubmitButtonToggle,
  policyId,
  handleModalToggle,
  handleLoading,
}: Readonly<CommonFormProps>) {
  const { orderId } = useParams<{ orderId: string }>();
  const { updateLead } = useLeadUpdaterFromOrder(data);
  const formClasses = useFormStyles();
  const { data: provinces } = useGetAddressDataQuery({
    pathParam: 'provinces',
    fieldName: 'provinces',
  });
  const [isDateInputEmpty, setIsDateInputEmpty] = useState(false);

  const flags = useFlags([
    FeatureFlags.BROK_122_UPDATE_CUSTOMER_ON_UPDATE_OF_QC_POLICY_20240808_TEMP,
  ]);
  const shouldUpdateCustomer =
    flags[
      FeatureFlags.BROK_122_UPDATE_CUSTOMER_ON_UPDATE_OF_QC_POLICY_20240808_TEMP
    ]?.enabled ?? false;

  const [
    updateOrder,
    { isSuccess: updateOrderSuccess, isLoading: isUpdatingOrder },
  ] = useUpdateOrderDataMutation();
  const [
    updateCustomer,
    { isSuccess: customerUpdatedSuccess, isLoading: isUpdatingCustomer },
  ] = useUpdateCustomer();
  const [
    createCustomerEmail,
    {
      isSuccess: createCustomerEmailSuccess,
      isLoading: isCreatingCustomerEmail,
    },
  ] = useCreateCustomerEmailMutation();
  const [
    updatePolicy,
    { isSuccess: updatePolicySuccess, isLoading: isUpdatingPolicy },
  ] = useUpdatePolicyDataMutation();

  const isLoading =
    isUpdatingCustomer ||
    isUpdatingOrder ||
    isCreatingCustomerEmail ||
    isUpdatingPolicy;

  const initialValues = fields.reduce((relatedFieldValues, field) => {
    if (field.name === 'email') {
      return {
        ...relatedFieldValues,
        [field.name]: _get(data, field.value)[0]?.email ?? '',
      };
    }

    if (field.name === 'title') {
      const title = _get(data, field.value);
      const titleOptions = optionsMap[field.name];
      return {
        ...relatedFieldValues,
        [field.name]: _find(titleOptions, ['value', title]),
      };
    }

    if (field.name === 'registeredProvince') {
      const provinceCode = _get(data, field.value);
      const provinceOptions =
        provinces?.length &&
        optionsMapping(provinces, 'nameEn', 'name')?.map((p) => ({
          ...p,
          value: p.value.replace('provinces/', ''),
        }));
      const selectedOption =
        provinceOptions?.find(
          (o: { value: string }) => Number(o.value) === Number(provinceCode)
        ) ?? null;
      return {
        ...relatedFieldValues,
        [field.name]: selectedOption,
      };
    }

    if (field.name === 'vehicleColor') {
      const colors: string[] = _get(data, field.value);
      const colorOptions = optionsMap[field.name];
      return {
        ...relatedFieldValues,
        [field.name]: colors?.map((color) =>
          _find(colorOptions, ['value', color])
        ),
      };
    }

    if (field.name === 'documentType') {
      const driverType = _get(data, field.value);
      const driverTypeOptions = optionsMap[field.name];
      return {
        ...relatedFieldValues,
        [field.name]: _find(driverTypeOptions, ['value', driverType]),
      };
    }

    // policyholder differentiation have different value and updatePath data structure
    if (field.name === 'policyHolderDifferentitation') {
      const [isCustomerValuePath, isCompanyValuePath] = field.value;
      const isCustomer = _get(data, isCustomerValuePath);
      const isCompany = _get(data, isCompanyValuePath);
      return {
        ...relatedFieldValues,
        [field.name]: _find(policyholderOptions, {
          payload: { isCustomer, isCompany },
        }),
      };
    }

    if (field.name === 'deliveryOption') {
      const deliveryOption = _get(data, field.value);
      return {
        ...relatedFieldValues,
        [field.name]: _find(optionsMap.deliveryOption, [
          'value',
          deliveryOption,
        ]),
      };
    }

    if (field.name === 'docsShipmentMethod') {
      const docsShipmentMethod = _get(data, field.value) ?? 'Email';
      return {
        ...relatedFieldValues,
        [field.name]: _find(optionsMap.docsShipmentMethod, [
          'value',
          docsShipmentMethod,
        ]),
      };
    }

    if (field.name === 'policyStartDate') {
      const policy = data?.items?.find((i) => i?.item?.name === policyId);
      const startDate = new Date(_get(policy, field.value)).toISOString();
      return {
        ...relatedFieldValues,
        [field.name]: startDate,
      };
    }

    if (field.name === 'policyHolderDOB') {
      const dob = new Date(_get(data, field.value)).toISOString();
      return {
        ...relatedFieldValues,
        [field.name]: dob,
      };
    }

    if (field.name === 'oicCode') {
      const raw = _get(data, field.value);
      const parsed = parseOicCodeForSelect(raw);
      const oicOptions = optionsMap[field.name] ?? [];
      const valid = oicOptions.some(
        (o: { value: string }) => o.value === parsed
      );
      return {
        ...relatedFieldValues,
        [field.name]: valid ? parsed : '',
      };
    }

    return {
      ...relatedFieldValues,
      [field.name]: _get(data, field.value),
    };
  }, {});

  const handleSubmit = async (values: FormikValues) => {
    if ('policyHolderDifferentitation' in values) {
      const payload = fields[0].updatePath.map((path: string) => {
        const { policyHolderDifferentitation } = values;
        const key = path.split('/')[2];
        return {
          op: 'add',
          path,
          value: policyHolderDifferentitation.payload[key],
        };
      });
      return updateOrder({
        orderId: orderId!,
        payload,
      }).unwrap();
    }
    if ('email' in values) {
      const customerName = _get(data, 'customer.customer.name');
      const { email } = values;
      return createCustomerEmail({
        customerName: customerName ?? '',
        email,
      });
    }

    if ('policyStartDate' in values) {
      const { policyStartDate } = values;
      const payload = {
        policyStartDate: `${formatISO(policyStartDate, {
          representation: 'date',
        })}T00:00:00+00:00`,
      };
      return updatePolicy({
        orderId,
        policyId: policyId?.split('/')[3] ?? '',
        payload,
      });
    }

    const payload = fields
      .map(({ name, value: valuePath, updatePath: path }) => {
        if (Array.isArray(valuePath) || Array.isArray(path)) return undefined;
        if (!path) return undefined;
        let value = formatValue(values[name]);
        if (name === 'policyHolderDOB')
          value = format(new Date(values[name]), 'yyyy-MM-dd');
        if (name === 'oicCode') {
          const raw = formatValue(values[name]);
          if (raw == null || raw === '') return undefined;
          value = formatOicCodeForOrder(String(raw));
        }

        return {
          op: 'add' as const,
          path,
          value,
        };
      })
      .filter(
        (field): field is { op: 'add'; path: string; value: unknown } =>
          field != null
      );

    await syncOrderDataPatchesToLead(payload, updateLead);

    await updateOrder({
      orderId: orderId!,
      payload,
    }).unwrap();
    return handleModalToggle();
  };

  const formik = useFormik({
    onSubmit: (values) => handleSubmit(values),
    initialValues,
  });

  useEffect(() => {
    handleLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const customerId = data?.customer.customer.name;
    const isCustomer = data?.order.data.policyHolder.isCustomer;
    if (
      !isUpdatingOrder &&
      updateOrderSuccess &&
      customerId &&
      shouldUpdateCustomer &&
      isCustomer
    ) {
      updateCustomer({
        customerId,
        payload: {
          firstName: formik.values.firstName,
          lastName: formik.values.lastName,
        },
      });
    }
  }, [isUpdatingOrder, updateOrderSuccess, shouldUpdateCustomer]);

  useEffect(() => {
    // Initialize a variable to keep track of whether the form is dirty or not
    const cleaned = cleanEmptyKeys(formik.values);

    const isDisableBtn = Object.keys(cleaned).every(
      (fieldName) =>
        formik.values[fieldName] !== '' &&
        formik.values[fieldName] !== null &&
        formik.values[fieldName] !== undefined &&
        formik.values[fieldName].length !== 0
    );
    // Set the submit button state based on the overall form dirtiness
    if (isDateInputEmpty) {
      setSubmitButtonToggle(isDateInputEmpty);
    } else {
      setSubmitButtonToggle(!isDisableBtn);
    }
  }, [isDateInputEmpty, formik.values, formik.dirty, setSubmitButtonToggle]);

  useEffect(() => {
    if (!handleModalToggle) return;

    if (
      customerUpdatedSuccess ||
      createCustomerEmailSuccess ||
      updatePolicySuccess
    ) {
      handleModalToggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerUpdatedSuccess, createCustomerEmailSuccess, updatePolicySuccess]);

  const handleInputChange = useCallback(
    (fieldName: string) => (fieldValue: Record<string, any>) => {
      if (fieldName === 'deliveryOption') {
        const docsShipmentMethodValue = fieldValue.value.includes(
          'digital-delivery'
        )
          ? _find(optionsMap.docsShipmentMethod, [
              'value',
              ShippingMethods.EMAIL,
            ])
          : _find(optionsMap.docsShipmentMethod, [
              'value',
              ShippingMethods.COURIER,
            ]);
        formik.setFieldValue('docsShipmentMethod', docsShipmentMethodValue);
      }
      formik.setFieldValue(fieldName, fieldValue);
    },
    [formik, optionsMap.docsShipmentMethod]
  );

  return (
    <form
      id="update-data-myself"
      data-testid="update-data-myself-form"
      onSubmit={formik.handleSubmit}
      className={formClasses.root}
    >
      {fields?.map((field: any, idx) => {
        const key = `${field.name}${idx}`;
        return (
          <Input
            key={key}
            label={field?.title}
            value={formik.values[field.name]}
            options={optionsMap[field.name]}
            handleOnChange={handleInputChange(field.name)}
            fieldType={field.fieldType}
            disabled={field.isReadonly}
            setIsDateInputEmpty={setIsDateInputEmpty}
            dataTestId={
              field.name === 'oicCode' ? 'qc-oic-code-select' : undefined
            }
          />
        );
      })}
    </form>
  );
}
