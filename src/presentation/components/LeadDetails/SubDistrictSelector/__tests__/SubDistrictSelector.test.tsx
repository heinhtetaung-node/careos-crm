import React from 'react';
import { of } from 'rxjs';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';
import LeadDetail from 'data/repository/leadDetail/cloud';

import SubDistrictSelector from '..';

interface IOption {
  name: string;
  nameEn: string;
  nameTh: string;
  postcode: number;
}

const options: IOption[] = [
  {
    name: 'provinces/100000/districts/100100/subdistricts/100101',
    nameEn: 'Phra Borom Maha Ratchawang',
    nameTh: 'พระบรมมหาราชวัง',
    postcode: 100101,
  },
  {
    name: 'provinces/100000/districts/100100/subdistricts/100102',
    nameEn: 'Wang Burapha Phirom',
    nameTh: 'วังบูรพาภิรมย์',
    postcode: 100102,
  },
];

jest.mock('presentation/components/controls/Control', () => {
  return {
    A: true,
    Autocomplete: ({ onChange, name }: any) => {
      return (
        <input
          name={name}
          data-testid={name}
          onChange={(e) => {
            onChange(e, {
              target: {
                value: {
                  postcode: e.target.value,
                },
              },
            });
          }}
        />
      );
    },
  };
});

test('Render SubDistrictSelector', () => {
  const getSubDistrict = jest
    .spyOn(LeadDetail, 'getSubDistrict')
    .mockReturnValue(of(options));

  const testValue = 100101;
  const districtId = 100100;
  const { rerender } = render(
    <SubDistrictSelector
      name="test.subDistrict"
      label="test"
      placeholder="test"
      districtId=""
      setFieldValue={() => jest.fn()}
      onChange={() => jest.fn()}
      value=""
      keyForm="test"
    />
  );

  rerender(
    <SubDistrictSelector
      name="test.subDistrict"
      label="test"
      placeholder="test"
      districtId={districtId}
      setFieldValue={() => jest.fn()}
      onChange={() => jest.fn()}
      value={testValue}
      keyForm="test"
    />
  );
  const el = screen.queryByTestId('test.subDistrict');

  expect(el).toBeInTheDocument();
  expect(getSubDistrict).toHaveBeenCalled();
  fireEvent.change(screen.getByTestId('test.subDistrict'), {
    target: {
      value: 'provinces/100000',
    },
  });
});
