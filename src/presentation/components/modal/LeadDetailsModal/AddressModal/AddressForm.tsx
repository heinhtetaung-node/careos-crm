import { Grid, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FormikProps } from 'formik';
import React, { ChangeEvent } from 'react';

import { UserRoles } from 'config/constant';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import Controls from 'presentation/components/controls/Control';
import DistrictSelector from 'presentation/components/LeadDetails/DistrictSelector';
import ProvinceSelector from 'presentation/components/LeadDetails/ProvinceSelector';
import SubDistrictSelector from 'presentation/components/LeadDetails/SubDistrictSelector';
import { getString } from 'presentation/theme/localization';

import {
  AddressType,
  IFormData,
  getValueInForm,
  IFormDataKeys,
} from './helper';

const useStyles = makeStyles({
  customFormInput: {
    '& input': {
      border: 'none !important',

      '&:hover, &:focus': {
        transition: 'none !important',
        border: 'none !important',
        boxShadow: 'none !important',
      },
    },
  },
});

const addressTypes = [
  { id: 1, value: AddressType.PERSONAL, title: getString('text.personal') },
  { id: 2, value: AddressType.COMPANY, title: getString('text.company') },
  { id: 3, value: AddressType.OTHER, title: getString('text.other') },
];

interface IAddressFormProps {
  keyForm: IFormDataKeys;
  formik: FormikProps<IFormData>;
  hasDisabledField?: boolean;
  isOrderAddress?: boolean;
  isReadOnly?: boolean;
}

function GeneralInfo({
  keyForm,
  formik,
  isReadOnly,
  isOrderAddress,
}: Omit<IAddressFormProps, 'hasDisabledField'>) {
  const formData = getValueInForm(formik.values, keyForm);
  if (formData.addressType === AddressType.COMPANY) {
    return (
      <>
        <Grid item xs={12} md={12} data-testid="address-type-company">
          <Controls.Input
            data-testid={`${keyForm}.company-name`}
            name={`${keyForm}.companyName`}
            label={getString('text.companyName')}
            value={formData.companyName}
            fixedLabel
            placeholder={getString('text.enterCompanyName')}
            onChange={formik.handleChange}
            disabled={keyForm === 'policy' || isReadOnly || isOrderAddress}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Controls.Input
            name={`${keyForm}.taxId`}
            label={getString('text.taxId')}
            value={formData.taxId}
            placeholder={getString('text.enterTaxId')}
            fixedLabel
            onChange={formik.handleChange}
            disabled={keyForm === 'policy' || isReadOnly || isOrderAddress}
          />
        </Grid>
      </>
    );
  }
  return (
    <>
      <Grid item xs={12} md={12} data-testid="address-type-personal">
        <Controls.Input
          dataTestid={`${keyForm}.first-name`}
          name={`${keyForm}.firstName`}
          label={getString('text.firstName')}
          value={formData.firstName}
          placeholder={getString('text.enterFirstName')}
          fixedLabel
          onChange={formik.handleChange}
          error={
            formik.errors[keyForm]?.firstName &&
            formik.touched[keyForm]?.firstName
              ? formik.errors[keyForm]?.firstName
              : ''
          }
          onKeyUp={() => {
            formik.setFieldTouched(`${keyForm}.firstName`, true, false);
          }}
          disabled={keyForm === 'policy' || isReadOnly}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <Controls.Input
          name={`${keyForm}.lastName`}
          label={getString('text.lastName')}
          placeholder={getString('text.enterLastName')}
          value={formData.lastName}
          error={
            formik.errors[keyForm]?.lastName &&
            formik.touched[keyForm]?.lastName
              ? formik.errors[keyForm]?.lastName
              : ''
          }
          fixedLabel
          onChange={formik.handleChange}
          onKeyUp={() => {
            formik.setFieldTouched(`${keyForm}.lastName`, true, false);
          }}
          disabled={keyForm === 'policy' || isReadOnly}
        />
      </Grid>
    </>
  );
}

function AddressForm({
  keyForm,
  formik,
  hasDisabledField = false,
  isOrderAddress = false,
  isReadOnly = false,
}: IAddressFormProps) {
  const { data: user } = useGetAuthenticateQuery();
  const ableToEditPostalCode = [
    UserRoles.ADMIN_ROLE,
    UserRoles.SUPER_ADMIN_ROLE,
  ].includes(user?.role as UserRoles);
  const classes = useStyles();
  const formData = getValueInForm(formik.values, keyForm);
  const { setFieldValue, values } = formik;
  let newOptions = addressTypes;

  if (formData && hasDisabledField) {
    newOptions =
      formData.addressType === AddressType.COMPANY
        ? addressTypes.filter((at) => at.value === AddressType.COMPANY)
        : addressTypes.filter((at) => at.value !== AddressType.COMPANY);
  }

  const getProvinceId = values[keyForm].province
    ? `provinces/${values[keyForm].province}`
    : null;

  const getDistrictId =
    values[keyForm].province && values[keyForm].district
      ? `provinces/${values[keyForm].province}/districts/${values[keyForm].district}`
      : null;

  const handleSubDistrictChange = (
    e: ChangeEvent<{ name: string; value: any }>,
    postcode: number
  ) => {
    const subDistrictID = Number(
      e.target.value.name.replace(`${getDistrictId}/subdistricts/`, '')
    );
    setFieldValue(e.target.name, subDistrictID);
    setFieldValue(`${keyForm}.postCode`, postcode);
    setTimeout(() => formik.setFieldTouched(`${keyForm}.postCode`));
  };

  return (
    <Grid container>
      {!isOrderAddress && (
        <Grid item xs={12} md={12}>
          <InputLabel id={`${keyForm}-address-label`} shrink>
            {getString('addressModal.addrressType')}
          </InputLabel>
          <Controls.Select
            name={`${keyForm}.addressType`}
            placeholder={getString('text.select')}
            options={newOptions}
            value={formData.addressType}
            onChange={formik.handleChange}
            selectField="value"
            disabled={
              (formData?.addressType === AddressType.COMPANY &&
                hasDisabledField) ||
              isReadOnly
            }
          />
        </Grid>
      )}

      {(isOrderAddress || formData.addressType) && (
        <>
          <GeneralInfo
            formik={formik}
            keyForm={keyForm}
            isReadOnly={isReadOnly}
            isOrderAddress={isOrderAddress}
          />
          <Grid
            item
            xs={12}
            md={12}
            className="form-input"
            data-testid="test-address-type"
          >
            <Controls.Input
              name={`${keyForm}.address`}
              label={getString('text.address')}
              value={formData.address}
              onChange={formik.handleChange}
              placeholder={getString('text.enterAddress')}
              fixedLabel
              disabled={isReadOnly}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            className={`form-input ${classes.customFormInput}`}
          >
            <ProvinceSelector
              name={`${keyForm}.province`}
              label={getString('text.province')}
              placeholder={getString('text.select')}
              value={values[keyForm].province}
              setFieldValue={setFieldValue}
              keyForm={keyForm}
              disabled={isReadOnly}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            className={`form-input ${classes.customFormInput}`}
          >
            <DistrictSelector
              name={`${keyForm}.district`}
              label={getString('text.district')}
              placeholder={getString('text.select')}
              value={values[keyForm].district}
              provinceId={getProvinceId}
              disabled={!values[keyForm].province || isReadOnly}
              setFieldValue={setFieldValue}
              keyForm={keyForm}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            className={`form-input ${classes.customFormInput}`}
          >
            <SubDistrictSelector
              name={`${keyForm}.subDistrict`}
              label={getString('text.subDistrict')}
              placeholder={getString('text.select')}
              value={values[keyForm].subDistrict}
              onChange={handleSubDistrictChange}
              districtId={getDistrictId}
              disabled={!values[keyForm].district || isReadOnly}
              setFieldValue={setFieldValue}
            />
          </Grid>

          <Grid item xs={12} md={12} className="form-input">
            <Controls.Input
              name={`${keyForm}.postCode`}
              label={getString('text.postcode')}
              value={values[keyForm].postCode}
              disabled={!ableToEditPostalCode || isReadOnly}
              onChange={formik.handleChange}
              fixedLabel
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default AddressForm;
