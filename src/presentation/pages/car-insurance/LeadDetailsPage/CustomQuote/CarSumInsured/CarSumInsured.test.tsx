import { Form, Formik } from 'formik';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CarSumInsured from './index';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  Trans: jest.fn().mockImplementation(({ defaults }) => defaults),
}));

const initailValues = {
  carAge: '',
  carSubmodals: '',
};

describe('<CarSumInsured />', () => {
  test('set fields on mount', () => {
    render(
      <Formik initialValues={initailValues} onSubmit={jest.fn()}>
        <Form>
          <CarSumInsured carAge={12} carSubmodels="carsubmodel" />
        </Form>
      </Formik>
    );
    expect(screen.getByDisplayValue('12')).toBeDisabled();
    expect(screen.getByDisplayValue('12')).toHaveAttribute('name', 'car_age');
    expect(screen.getByDisplayValue('carsubmodel')).toBeDisabled();
    expect(screen.getByDisplayValue('carsubmodel')).toHaveAttribute(
      'name',
      'car_submodels'
    );
  });
});
