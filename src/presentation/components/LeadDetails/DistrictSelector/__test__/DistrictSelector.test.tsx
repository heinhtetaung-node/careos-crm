import React from 'react';
import { of } from 'rxjs';

import { render, screen, fireEvent } from '__tests__/rtl-test-utils';
import LeadDetail from 'data/repository/leadDetail/cloud';

import DistrictSelector from '..';

const options = [
  {
    name: 'provinces/100000/districts/100100',
    nameEn: 'Phra Nakhon',
    nameTh: 'พระนคร',
  },
  {
    name: 'provinces/100000/districts/100200',
    nameEn: 'Dusit',
    nameTh: 'ดุสิต',
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
            onChange({
              target: {
                value: {
                  name: e.target.value,
                },
              },
            });
          }}
        />
      );
    },
  };
});

test('Test DistrictSelector component', () => {
  jest.spyOn(LeadDetail, 'getDistrict').mockReturnValue(of(options));

  const testValue = 100100;
  render(
    <DistrictSelector
      id="test"
      label="testLabel"
      provinceId="provinceId"
      value={testValue}
      setFieldValue={() => jest.fn()}
      keyForm="keyForm"
      name="name"
    />
  );

  // Same Shipment address
  expect(screen.getByTestId('name')).toBeInTheDocument();
  fireEvent.change(screen.getByTestId('name'), {
    target: {
      value: 'provinces/100000/districts/100100',
    },
  });
});
