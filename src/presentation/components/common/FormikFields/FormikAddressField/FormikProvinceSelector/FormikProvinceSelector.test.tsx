import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikProvinceSelector from './index';

const config = {
  name: 'province',
  title: 'text.province',
  dataTestId: 'formik-text-field-input-1',
};

it('Render FormikProvinceSelector', () => {
  render(
    <Formik
      initialValues={{
        province: null,
        districts: [],
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikProvinceSelector {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.province')).toBeVisible();
});

it('Render FormikProvinceSelector with no test id', () => {
  const provinceConfig = {
    name: 'province',
    title: 'text.province',
  };
  render(
    <Formik
      initialValues={{
        province: null,
        districts: [],
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikProvinceSelector {...provinceConfig} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.province')).toBeVisible();
});

it('Handle FormikProvinceSelector select', async () => {
  render(
    <Formik
      initialValues={{
        province: null,
        districts: [],
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikProvinceSelector {...config} />
      </Form>
    </Formik>
  );
  await userEvent.click(screen.getByRole('button'));
  const listbox = within(screen.getByRole('listbox'));

  await waitFor(() => {
    expect(listbox).toBeTruthy();
  });
});
