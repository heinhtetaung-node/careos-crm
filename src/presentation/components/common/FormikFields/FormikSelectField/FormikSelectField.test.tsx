import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikSelectField from './index';

const config = {
  name: 'insuranceType',
  title: 'text.insuranceType',
  dataTestId: 'formik-text-field-input-1',
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

it('Render FormikSelectField', () => {
  render(
    <Formik initialValues={{ insuranceType: null }} onSubmit={jest.fn()}>
      <Form>
        <FormikSelectField {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.insuranceType')).toBeVisible();
});

it('Handle FormikSelectField select', async () => {
  render(
    <Formik initialValues={{ insuranceType: null }} onSubmit={jest.fn()}>
      <Form>
        <FormikSelectField {...config} />
      </Form>
    </Formik>
  );
  await userEvent.click(screen.getByRole('button'));
  const listbox = within(screen.getByRole('listbox'));
  await userEvent.click(listbox.getByText('insuranceTypes.type2'));
  await waitFor(() => {
    expect(screen.getByRole('button')).toHaveTextContent(
      'insuranceTypes.type2'
    );
  });
});
