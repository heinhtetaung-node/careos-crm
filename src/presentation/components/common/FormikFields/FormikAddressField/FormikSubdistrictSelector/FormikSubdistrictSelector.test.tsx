import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikSubdistrictSelector from './index';

const config = {
  name: 'subDistrict',
  title: 'text.subDistrict',
  dataTestId: 'formik-text-field-input-1',
};

it('Render FormikSubdistrictSelector', () => {
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
        <FormikSubdistrictSelector {...config} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.subDistrict')).toBeVisible();
});

it('Render FormikSubdistrictSelector with no testid', () => {
  const subDistrictConfig = {
    name: 'subDistrict',
    title: 'text.subDistrict',
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
        <FormikSubdistrictSelector {...subDistrictConfig} />
      </Form>
    </Formik>
  );
  expect(screen.getByText('text.subDistrict')).toBeVisible();
});

it('Handle FormikSubdistrictSelector select', async () => {
  render(
    <Formik
      initialValues={{
        province: 100000,
        district: 100100,
        districts: [],
        subDistrict: 100101,
        postcode: '',
        subDistricts: [
          {
            name: 'provinces/100000/districts/100100/subdistricts/100101',
            nameEn: 'Phra Borom Maha Ratchawang',
            nameTh: 'พระบรมมหาราชวัง',
            postcode: 10200,
          },
          {
            name: 'provinces/100000/districts/100100/subdistricts/100102',
            nameEn: 'Wang Burapha Phirom',
            nameTh: 'วังบูรพาภิรมย์',
            postcode: 10200,
          },
          {
            name: 'provinces/100000/districts/100100/subdistricts/100103',
            nameEn: 'Wat Ratchabophit',
            nameTh: 'วัดราชบพิธ',
            postcode: 10200,
          },
        ],
      }}
      onSubmit={jest.fn()}
    >
      <Form>
        <FormikSubdistrictSelector {...config} />
      </Form>
    </Formik>
  );
  await userEvent.click(screen.getByRole('button'));
  const listbox = within(screen.getByRole('listbox'));
  await userEvent.click(
    listbox.getByText('provinces/100000/districts/100100/subdistricts/100102')
  );
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => {
    expect(
      screen.getByText('provinces/100000/districts/100100/subdistricts/100103')
    ).toBeInTheDocument();
  });
});
