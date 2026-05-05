import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikController from './index';

it('Render FormikController fieldType Select', async () => {
  const config = {
    name: 'insuranceType',
    title: 'text.insuranceType',
    display: true,
    fieldType: 'select' as const,
    options: [
      {
        id: 0,
        val: 'type-1',
        title: 'insuranceTypes.type1',
      },
      {
        id: 1,
        val: 'type-2',
        title: 'insuranceTypes.type2',
      },
    ],
  };
  render(
    <Formik initialValues={{ insuranceType: '' }} onSubmit={jest.fn()}>
      <Form>
        <FormikController {...config} />
      </Form>
    </Formik>
  );
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => {
    expect(screen.getByRole('listbox')).toBeTruthy();
  });
});

it('Render FormikController fieldType Radio', async () => {
  const config = {
    name: 'insuranceType',
    title: 'text.insuranceType',
    display: true,
    fieldType: 'radio' as const,
    options: [
      {
        id: 0,
        val: 'type-1',
        title: 'insuranceTypes.type1',
      },
      {
        id: 1,
        val: 'type-2',
        title: 'insuranceTypes.type2',
      },
    ],
  };
  render(
    <Formik initialValues={{ insuranceType: '' }} onSubmit={jest.fn()}>
      <Form>
        <FormikController {...config} />
      </Form>
    </Formik>
  );
  const option1 = screen.getByRole('radio', { name: 'insuranceTypes.type1' });
  await userEvent.click(option1);
  await waitFor(() => {
    expect(option1).toBeChecked();
    expect(screen.getByRole('radiogroup')).toBeTruthy();
  });
});

it('Handle FormikController if display set to false', async () => {
  const config = {
    name: 'email',
    title: 'text.email',
    display: false,
    fieldType: 'text' as const,
    dataTestId: 'formik-text-field-input',
  };
  render(
    <Formik initialValues={{ insuranceType: '' }} onSubmit={jest.fn()}>
      <Form>
        <FormikController {...config} />
      </Form>
    </Formik>
  );
  expect(() => screen.getByTestId('formik-text-field-input')).toThrow();
});
