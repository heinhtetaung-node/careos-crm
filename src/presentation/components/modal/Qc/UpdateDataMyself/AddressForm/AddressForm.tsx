import { useFormik } from 'formik';
import _find from 'lodash/find';
import React, { useEffect, useMemo, useState } from 'react';
import { getI18n } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { UserRoles } from 'config/constant';
import { PRODUCTS } from 'config/TypeFilter';
import {
  useGetAddressDataQuery,
  useLazyGetAddressDataQuery,
} from 'data/slices/addressSlice';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  useLazyGetOrderItemsQuery,
  useUpdateOrderDataMutation,
} from 'data/slices/orderSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';

import { optionsMapping } from '../helper';
import { useFormStyles } from '../index.styles';
import { OptionProps } from '../Input';
import { AddressProps } from '../type';

export default function AddressForm({
  orderProduct,
  addressLine,
  province,
  provinceCode,
  district,
  districtCode,
  subDistrict,
  subDistrictCode,
  postalCode,
  disabled,
  fields,
  fullName,
  firstName,
  lastName,
  question,
  addressType,
  handleModalToggle,
  setSubmitButtonToggle,
}: AddressProps) {
  const { orderId } = useParams();
  const formStyles = useFormStyles();

  const { data: user } = useGetAuthenticateQuery();
  const ableToEditPostalCode = [
    UserRoles.ADMIN_ROLE,
    UserRoles.SUPER_ADMIN_ROLE,
  ].includes(user?.role as UserRoles);

  const { data: provinces, isFetching: isProvincesFetching } =
    useGetAddressDataQuery({
      pathParam: 'provinces',
      fieldName: 'provinces',
    });

  const { data: districts, isFetching: isDistrictsFetching } =
    useGetAddressDataQuery(
      {
        pathParam: `provinces/${provinceCode}/districts`,
        fieldName: 'districts',
      },
      { skip: !provinceCode }
    );

  const { data: subDistricts, isFetching: isSubDistrictsFetching } =
    useGetAddressDataQuery(
      {
        pathParam: `provinces/${provinceCode}/districts/${districtCode}/subdistricts`,
        fieldName: 'subdistricts',
      },
      { skip: !provinceCode || !districtCode }
    );

  const [trigger, { data }] = useLazyGetAddressDataQuery();
  const [updateOrder, { isSuccess: updateOrderSuccess }] =
    useUpdateOrderDataMutation();
  const [fetchOrder] = useLazyGetOrderItemsQuery();

  const [provinceOptions, setProvinceOptions] = useState<OptionProps[]>([]);
  const [districtOptions, setDistrictOptions] = useState<OptionProps[]>([]);
  const [subDistrictOptions, setSubDistrictOptions] = useState<OptionProps[]>(
    []
  );

  // field name use to look up in the response to get translated value
  const nameLookup = useMemo(() => {
    const language = getI18n()?.language || 'en';
    return language === 'en' ? 'nameEn' : 'nameTh';
  }, []);

  useEffect(() => {
    if (!isProvincesFetching) {
      setProvinceOptions(optionsMapping(provinces, nameLookup, 'name'));
    }

    if (!isDistrictsFetching) {
      setDistrictOptions(optionsMapping(districts, nameLookup, 'name'));
    }

    if (!isSubDistrictsFetching) {
      setSubDistrictOptions(optionsMapping(subDistricts, nameLookup, 'name'));
    }
  }, [
    isProvincesFetching,
    isDistrictsFetching,
    isSubDistrictsFetching,
    provinces,
    districts,
    subDistricts,
    nameLookup,
  ]);

  const formatValues = (input: Record<string, any>) => {
    const values: Record<string, any>[] = [];
    Object.entries(input).forEach(([k, v]) => {
      if (v) {
        // Is v an object?
        if (typeof v === 'object' && v !== null) {
          if (!v.value) return;
          const val = v.value?.split('/');
          const formattedValue = val && parseInt(val[val.length - 1], 10);
          if (formattedValue) {
            values.push({
              op: 'add',
              path: _find(fields, ['name', k])?.updatePath,
              value: formattedValue,
            });
          }
        } else {
          const value =
            k === 'postalCode' && ableToEditPostalCode ? Number(v) : v;
          values.push({
            op: 'add',
            path: _find(fields, ['name', k])?.updatePath,
            value,
          });
        }
      }
    });
    return values;
  };

  const getSameAddressPayload = (sameAsPolicyAddress: boolean) => {
    if (question === Questions.SHIPPING_ADDRESS) {
      return [
        {
          op: 'add',
          path: 'data/policyHolder/policyAddress/isShippingAddress',
          value: sameAsPolicyAddress,
        },
      ];
    }
    return [
      {
        op: 'add',
        path: 'data/policyHolder/policyAddress/isBillingAddress',
        value: sameAsPolicyAddress,
      },
    ];
  };

  const getAddressPayload = (options: Record<string, any>) => {
    const formattedValue = formatValues(options);
    let extras: Record<string, any>[] = [];
    // Add first and last names for Shipping addresses
    if (question === Questions.SHIPPING_ADDRESS) {
      const isMotor = orderProduct === PRODUCTS.CAR_PRODUCT_INSURANCE;
      extras = [
        {
          op: 'add',
          path: 'data/policyHolder/shippingAddress/firstName',
          value: firstName ?? '',
        },
        {
          op: 'add',
          path: 'data/policyHolder/shippingAddress/lastName',
          value: lastName ?? '',
        },
        {
          op: 'add',
          path: 'data/policyHolder/shippingAddress/addressType',
          value: addressType,
        },
        ...(isMotor
          ? [
              {
                op: 'add',
                path: 'data/policyHolder/shippingAddress/fullName',
                value: fullName ?? '',
              },
            ]
          : []),
      ];
    }
    // For Billing address, add a few more fields for BE
    if (question === Questions.BILLING_ADDRESS) {
      extras = [
        {
          op: 'add',
          path: 'data/policyHolder/billingAddress/addressType',
          value: addressType, // NOTE: no field on FE for now
        },
        {
          op: 'add',
          path: 'data/policyHolder/billingAddress/fullName',
          value: fullName ?? '',
        },
        {
          op: 'add',
          path: 'data/policyHolder/billingAddress/firstName',
          value: firstName ?? '',
        },
        {
          op: 'add',
          path: 'data/policyHolder/billingAddress/lastName',
          value: lastName ?? '',
        },
      ];
    }
    const notSameAsPolicy = getSameAddressPayload(false);
    return [...formattedValue, ...notSameAsPolicy, ...extras];
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Record<string, any>[] = [];
    // if policy address, format the values
    if (question === Questions.POLICYHOLDER_ADDRESS) {
      const formattedValue = formatValues(values);
      payload.push(...formattedValue);
    } else {
      // for billing address and shipping address
      // check if disabled, which means it's the same address as policy
      // otherwise, format the values and set sameAsPolicy to false
      const otherAddress = disabled
        ? getSameAddressPayload(true)
        : getAddressPayload(values);
      payload.push(...otherAddress);
    }
    updateOrder({
      orderId: orderId!,
      payload,
    });
  };

  const formik = useFormik({
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
    initialValues: {
      addressLine,
      province: { title: province, value: `provinces/${provinceCode}` },
      district: {
        title: district,
        value: `provinces/${provinceCode}/districts/${districtCode}`,
      },
      subDistrict: {
        title: subDistrict,
        value: `provinces/${provinceCode}/districts/${districtCode}/subdistricts/${subDistrictCode}`,
      },
      postalCode,
    },
  });

  useEffect(() => {
    if (updateOrderSuccess) {
      fetchOrder({ orderId: orderId! });
      if (handleModalToggle) {
        handleModalToggle();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateOrderSuccess]);

  useEffect(() => {
    if (!setSubmitButtonToggle) return;
    if (formik.values) {
      const isDisableBtn = Object.keys(formik.values).every((fieldName) => {
        const key = fieldName as keyof typeof formik.values;
        return (
          formik.values[key] !== '' &&
          formik.values[key] !== null &&
          formik.values[key] !== undefined &&
          (formik.values[key] as unknown as any).length !== 0
        );
      });

      setSubmitButtonToggle(!isDisableBtn);
    }
  }, [formik, formik.values, setSubmitButtonToggle]);

  useEffect(
    () => () => {
      setProvinceOptions([]);
      setDistrictOptions([]);
      setSubDistrictOptions([]);
    },
    []
  );

  const resetField = (field: 'province' | 'district') => {
    if (field === 'province') {
      formik.setFieldValue('district', { title: '', value: '' });
    }
    formik.setFieldValue('subDistrict', { title: '', value: '' });
    formik.setFieldValue('postalCode', '');
  };

  const handleAddressChange =
    (
      field: 'province' | 'district',
      dependentField: string,
      setDependentOptions: React.Dispatch<React.SetStateAction<OptionProps[]>>
    ) =>
    (_e: React.ChangeEvent<Element>, value: any) => {
      formik.setFieldValue(field, value);
      resetField(field);
      if (value) {
        (async () => {
          const { data: options } = await trigger({
            pathParam: `${value?.value}/${dependentField}`,
            fieldName: dependentField,
          });
          const dependentOptions = optionsMapping(options, nameLookup, 'name');
          setDependentOptions(dependentOptions);
        })();
      }
    };
  return (
    <form
      id="update-data-myself"
      data-testid="update-data-myself-form"
      onSubmit={formik.handleSubmit}
      className={formStyles.root}
    >
      <CommonTextField
        className="input"
        dataTestId="address-line-textfield"
        label={getString('qc.address')}
        name="address"
        placeholder={getString('qc.typeHere')}
        value={formik.values.addressLine}
        disabled={disabled}
        onChange={(e) => {
          formik.setFieldValue('addressLine', e.target.value);
        }}
      />
      <Autocomplete
        className="input"
        textFieldProps={{
          dataTestId: 'province-autocomplete',
          placeholder: getString('qc.select'),
          label: getString('text.province'),
          name: 'province',
        }}
        value={formik.values.province ?? { title: '', value: '' }}
        options={provinceOptions ?? []}
        onChange={
          handleAddressChange(
            'province',
            'districts',
            setDistrictOptions
          ) as any
        }
        optionTextKey="title"
        getOptionSelected={(option: any, value: any) =>
          option.value === value.value
        }
        disabled={disabled}
      />
      <Autocomplete
        className="input"
        textFieldProps={{
          label: getString('text.district'),
          placeholder: getString('qc.select'),
          name: 'district',
          dataTestId: 'district-autocomplete',
        }}
        value={formik.values.district ?? { title: '', value: '' }}
        options={districtOptions ?? []}
        onChange={
          handleAddressChange(
            'district',
            'subdistricts',
            setSubDistrictOptions
          ) as any
        }
        optionTextKey="title"
        getOptionSelected={(option: any, value: any) =>
          option.value === value.value
        }
        disabled={disabled}
      />
      <Autocomplete
        className="input"
        textFieldProps={{
          label: getString('text.subDistrict'),
          placeholder: getString('qc.select'),
          name: 'subDistrict',
          dataTestId: 'subdistrict-autocomplete',
        }}
        value={formik.values.subDistrict ?? { title: '', value: '' }}
        options={subDistrictOptions ?? []}
        optionTextKey="title"
        getOptionSelected={(option: any, value: any) =>
          option.value === value.value
        }
        onChange={(_e, value) => {
          formik.setFieldValue('subDistrict', value);
          const newPostalCode =
            _find(data, ['name', (value as OptionProps)?.value])?.postcode ??
            postalCode;
          formik.setFieldValue('postalCode', newPostalCode);
        }}
        disabled={disabled}
      />
      <CommonTextField
        className="input"
        label={getString('text.postcode')}
        dataTestId="postal-code-textfield"
        name="postalCode"
        value={formik.values.postalCode}
        disabled={!ableToEditPostalCode || disabled}
        onChange={(e) => {
          formik.setFieldValue('postalCode', e.target.value);
        }}
      />
    </form>
  );
}
