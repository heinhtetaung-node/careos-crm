import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikTextContent from './index';

const config = {
  name: 'vehicleType',
  title: 'text.typeOfVehicle',
  color: 'primary',
  dataTestId: 'formik-text-field-textcontent',
};

it('Render FormikTextContent with no value', () => {
  render(
    <Formik initialValues={{ vehicleType: null }} onSubmit={jest.fn()}>
      <Form>
        <FormikTextContent {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('-')).toBeVisible();
});

it('Render FormikTextContent with value', () => {
  render(
    <Formik
      initialValues={{ vehicleType: 'This is a car name' }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikTextContent {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('This is a car name')).toBeVisible();
});
