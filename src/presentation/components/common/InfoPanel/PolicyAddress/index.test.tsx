import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import PolicyHolderAddress from '.';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  getI18n: () => ({
    t: (str: string) => str,
    language: 'th',
  }),
}));

const address = {
  province: 'Samut Prakan',
  provinceTh: 'สมุทรปราการ',
  district: 'Bang Phli',
  districtTh: 'บางพลี',
  subDistrict: 'Bang Chalong',
  subDistrictTh: 'บางโฉลง',
  zipcode: 10540,
  addressLine: '99/2 หมู่ 4 ซอย4/10',
};

test('Test <PolicyHolderAddress/> render address', () => {
  jest.dontMock('react-i18next');

  render(<PolicyHolderAddress address={address} />);
  expect(screen.getByText('99/2 หมู่ 4 ซอย4/10')).toBeInTheDocument();
  expect(screen.getByText('สมุทรปราการ')).toBeInTheDocument();
  expect(screen.getByText('บางโฉลง')).toBeInTheDocument();
  expect(screen.getByText('บางพลี')).toBeInTheDocument();
  expect(screen.getByText('10540')).toBeInTheDocument();
});
