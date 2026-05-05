import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import * as Yup from 'yup';

import FormikWrapper from './index';

const handleUpdate = jest.fn();

it('Render FormikWrapper with no items', () => {
  const config = {
    title: 'text.vehicle',
    items: [],
    initialValues: {},
    validationSchema: {},
    handleUpdate,
  };
  render(<FormikWrapper {...config} />);
  expect(screen.getByText('text.vehicle')).toBeTruthy();
});

it('Render FormikWrapper with no title', () => {
  const config = {
    title: '',
    items: [],
    initialValues: {},
    validationSchema: {},
    handleUpdate,
  };
  render(<FormikWrapper {...config} />);
  expect(screen.getByRole('heading')).toHaveTextContent('');
});

it('Render FormikWrapper with items', async () => {
  const config = {
    title: 'text.vehicle',
    items: [
      {
        name: 'firstName',
        title: 'text.firstName',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-1',
      },
      {
        name: 'lastName',
        title: 'text.lastName',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-2',
      },
      {
        name: 'email',
        title: 'text.email',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-3',
      },
      {
        name: 'phone',
        title: 'text.phone',
        fieldType: 'text' as const,
        display: false,
        dataTestId: 'formik-text-field-input-4',
      },
    ],
    initialValues: {
      firstName: '',
      lastName: 'Smith',
      email: 'test@aol.com',
      phone: '129182981',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('This is required'),
      lastName: Yup.string().required('This is required'),
      email: Yup.string()
        .email('Please enter a valid email')
        .required('This is required'),
      phone: Yup.string().required('This is required'),
    }),
    handleUpdate,
  };
  render(<FormikWrapper {...config} />);

  const input = screen.getByTestId('formik-text-field-input-1-input');
  await userEvent.type(input, 'ma');
  await userEvent.tab();

  expect(screen.getAllByRole('textbox').length).toEqual(3);
  await waitFor(() => {
    expect(input).toHaveValue('ma');
  });

  await waitFor(
    () => {
      expect(handleUpdate).toHaveBeenCalled();
    },
    {
      timeout: 2000,
    }
  );
});

it('Render FormikWrapper with no handleUpdate callback', async () => {
  const config = {
    handleUpdate,
    title: 'text.vehicle',
    items: [
      {
        name: 'firstName',
        title: 'text.firstName',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-1',
      },
      {
        name: 'lastName',
        title: 'text.lastName',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-2',
      },
      {
        name: 'email',
        title: 'text.email',
        fieldType: 'text' as const,
        display: true,
        dataTestId: 'formik-text-field-input-3',
      },
      {
        name: 'phone',
        title: 'text.phone',
        fieldType: 'text' as const,
        display: false,
        dataTestId: 'formik-text-field-input-4',
      },
    ],
    initialValues: {
      firstName: '',
      lastName: 'Smith',
      email: 'test@aol.com',
      phone: '129182981',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('This is required'),
      lastName: Yup.string().required('This is required'),
      email: Yup.string()
        .email('Please enter a valid email')
        .required('This is required'),
      phone: Yup.string().required('This is required'),
    }),
  };
  render(<FormikWrapper {...config} />);
  const input = screen.getByTestId('formik-text-field-input-1-input');
  userEvent.type(input, 'ma');
  userEvent.tab();
  expect(screen.getAllByRole('textbox').length).toEqual(3);
  await waitFor(() => {
    expect(input).toHaveValue('ma');
  });
});
