import React from 'react';
import { of } from 'rxjs';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';
import LeadDetail from 'data/repository/leadDetail/cloud';

import ProvinceSelector from '..';

interface IOption {
  name: string;
  nameEn: string;
  nameTh: string;
}

const options: IOption[] = [
  {
    name: 'provinces/100000',
    nameEn: 'Province 1',
    nameTh: 'ดุสิต',
  },
  {
    name: 'provinces/100001',
    nameEn: 'Province 2',
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

test('Render ProvinceSelector', () => {
  const getProvinces = jest
    .spyOn(LeadDetail, 'getProvince')
    .mockReturnValue(of(options));

  const testValue = 100000;
  render(
    <ProvinceSelector
      name="test.province"
      label="test"
      placeholder="test"
      setFieldValue={() => jest.fn()}
      value={testValue}
      keyForm="test"
    />
  );
  const el = screen.queryByTestId('test.province');

  expect(el).toBeInTheDocument();
  expect(getProvinces).toHaveBeenCalled();
  fireEvent.change(screen.getByTestId('test.province'), {
    target: {
      value: 'provinces/100000',
    },
  });
});
