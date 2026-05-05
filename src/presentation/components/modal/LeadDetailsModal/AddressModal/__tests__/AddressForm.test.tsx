import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import AddressForm from '../AddressForm';

jest.mock('presentation/components/LeadDetails/SubDistrictSelector');

const initialFormDataInfo: any = {
  values: {
    policy: {
      addressType: 'company',
      address: 'test',
      province: '',
      district: '',
      postCode: '',
      firstName: '',
      lastName: '',
      taxId: '',
      companyName: '',
      subDistrict: '',
    },
    shipping: {
      addressType: '',
      address: '',
      province: '',
      district: '',
      postCode: '',
      firstName: '',
      lastName: '',
      taxId: '',
      companyName: '',
      subDistrict: '',
    },
    billing: {
      addressType: '',
      address: '',
      province: '',
      district: '',
      postCode: '',
      firstName: '',
      lastName: '',
      taxId: '',
      companyName: '',
      subDistrict: '',
    },
    shipmentAddressIsSame: true,
    billingAddressIsSame: true,
  },
};

describe('Test <AddressForm> Modal', () => {
  it('should render the company address type if we passed company type', () => {
    render(
      <AddressForm keyForm="policy" formik={initialFormDataInfo as any} />
    );
    expect(screen.getByTestId('address-type-company')).toBeInTheDocument();
    expect(screen.getByTestId('policy.company-name')).toBeInTheDocument();
  });
});
