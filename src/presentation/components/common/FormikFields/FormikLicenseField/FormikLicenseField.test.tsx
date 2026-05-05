import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikLicenseField from './index';

it('Render FormikLicenseField', () => {
  const config = {
    name: 'license',
    title: 'text.licensePlate',
    dataTestId: 'test-license',
    placeholder: 'text.enterPlaceholder',
    province: 'กท',
  };
  render(
    <Formik initialValues={{ license: 'ทก9-1212' }} onSubmit={jest.fn()}>
      <Form>
        <FormikLicenseField {...config} />
      </Form>
    </Formik>
  );
  const firstPart = screen.getByTestId('test-license-first-input');
  const lastPart = screen.getByTestId('test-license-last-input');
  const province = screen.getByTestId('test-license-province');
  expect(firstPart).toHaveValue('ทก9');
  expect(lastPart).toHaveValue('1212');
  expect(province).toHaveTextContent('กท');
});

it('Render FormikLicenseField readonly', async () => {
  const config = {
    name: 'license',
    title: 'text.licensePlate',
    dataTestId: 'test-license',
    placeholder: 'text.enterPlaceholder',
    province: 'กท',
    isReadOnly: true,
  };
  render(
    <Formik initialValues={{ license: '' }} onSubmit={jest.fn()}>
      <Form>
        <FormikLicenseField {...config} />
      </Form>
    </Formik>
  );
  await waitFor(() => {
    expect(
      screen.getByTestId('test-license-readonly-text')
    ).toBeInTheDocument();
  });
});

it('FormikLicenseField handle valid input change', async () => {
  const config = {
    name: 'license',
    title: 'text.licensePlate',
    dataTestId: 'test-license',
    placeholder: 'text.enterPlaceholder',
  };
  render(
    <Formik initialValues={{ license: 'กท-1212' }} onSubmit={jest.fn()}>
      <Form>
        <FormikLicenseField {...config} />
      </Form>
    </Formik>
  );
  const editButton = screen.getByRole('button');
  await userEvent.click(editButton);
  const input = screen.getByTestId('test-license-first-input');
  await userEvent.type(input, 'e');
  await waitFor(() => {
    expect(input).toHaveValue('กทe');
  });
});

it('FormikLicenseField handle invalid input change', async () => {
  const config = {
    name: 'license',
    title: 'text.licensePlate',
    dataTestId: 'test-license',
  };
  render(
    <Formik initialValues={{ license: 'กท-1212' }} onSubmit={jest.fn()}>
      <Form>
        <FormikLicenseField {...config} />
      </Form>
    </Formik>
  );
  const input = screen.getByTestId('test-license-last-input');
  await userEvent.type(input, '1!');
  await waitFor(() => {
    expect(input).toHaveValue('12121!');
  });
});
