import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikDistrictSelector from './index';

const config = {
  name: 'district',
  title: 'text.district',
  dataTestId: 'formik-text-field-input-1',
};

it('Render FormikDistrictSelector', () => {
  render(
    <Formik
      initialValues={{
        province: 100000,
        districts: [],
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikDistrictSelector {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.district')).toBeVisible();
});

it('Render FormikDistrictSelector with no testid', () => {
  const districtConfig = {
    name: 'district',
    title: 'text.district',
    dataTestId: '',
  };
  render(
    <Formik
      initialValues={{
        province: 100000,
        districts: [],
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikDistrictSelector {...districtConfig} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.district')).toBeVisible();
});

it('Handle FormikDistrictSelector select', async () => {
  render(
    <Formik
      initialValues={{
        province: 100000,
        subDistricts: [],
        district: '',
        subDistrict: '',
        postcode: '',
        districts: [
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
          {
            name: 'provinces/100000/districts/100300',
            nameEn: 'Nong Chok',
            nameTh: 'หนองจอก',
          },
        ],
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikDistrictSelector {...config} />
      </Form>
    </Formik>
  );
  await userEvent.click(screen.getByRole('button'));
  const listbox = within(screen.getByRole('listbox'));
  await waitFor(() => {
    expect(listbox).toBeTruthy();
  });
});
