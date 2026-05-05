import { sub } from 'date-fns';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { getErrorWhenChangeDOB } from './helper';
import RenderValue from './RenderValue';

const objectValue = {
  editType: 'input',
  id: '91021644-9fe9-4b57-9a2e-c08120de29d0',
  isEdit: false,
  isEditable: false,
  isError: false,
  title: 'Lead ID',
  value: 'L62014',
};

describe('<RenderValue/>', () => {
  it('will be mounted correctly', () => {
    render(
      <RenderValue
        formValues={{}}
        objValue={objectValue as any}
        onSaveCustomerInputInfo={jest.fn()}
      />
    );
    expect(screen.getByTestId('text-input-')).toBeInTheDocument();
  });
});

describe('Test getErrorWhenChangDOB', () => {
  it('Should return error when age less than 18 years', () => {
    const dateContext = new Date();
    expect(getErrorWhenChangeDOB(dateContext, {} as any)).toEqual({
      isError: true,
      error: 'errors.invalidAgeUnder',
      value: dateContext,
    });
  });

  it('Should return error when age greater than 100 years', () => {
    const dateContext = '10-10-1902';
    expect(getErrorWhenChangeDOB(dateContext, {} as any)).toEqual({
      isError: true,
      error: 'errors.invalidAgeOver',
      value: dateContext,
    });
  });

  it('Should return state valid ', () => {
    const dateContext = sub(new Date(), { years: 30 });
    expect(getErrorWhenChangeDOB(dateContext as any, {} as any)).toEqual({
      isError: false,
      error: '',
      value: dateContext,
    });
  });
});
