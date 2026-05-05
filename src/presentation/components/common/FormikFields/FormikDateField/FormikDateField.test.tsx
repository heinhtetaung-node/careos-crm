import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import * as React from 'react';

import FormikDateField from './index';

test('Render FormikDateField', () => {
  const config = {
    name: 'startDate',
    title: 'text.dob',
    dataTestId: 'test-date',
  };
  render(
    <Formik
      initialValues={{ startDate: '10/10/2010' }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <Form>
        <FormikDateField {...config} />
      </Form>
    </Formik>
  );
  const textbox = screen.getByTestId('test-date-datefield');
  expect(textbox).toBeTruthy();
  expect(textbox).toHaveValue('10/10/2010');
});

test('Render FormikDateField handle input change', async () => {
  const config = {
    name: 'dob',
    title: 'text.dob',
    dataTestId: 'test-date',
  };
  render(
    <Formik
      initialValues={{ dob: '12/12/2020' }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <Form>
        <FormikDateField {...config} />
      </Form>
    </Formik>
  );
  const input = screen.getByTestId('test-date-datefield');
  userEvent.clear(input);
  userEvent.tab();
  await waitFor(() => {
    expect(input).toHaveValue('');
  });

  input.focus();
  userEvent.type(input, '12/12/2020{enter}');
  await waitFor(() => {
    expect(input).toHaveValue('12/12/2020');
  });
});
