import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render } from '__tests__/rtl-test-utils';

import DetailViewDatepicker from './index';

const handleUpdate = jest.fn();
const setFormikValue = jest.fn();
const formikSubmit = jest.fn();
const setFormikError = jest.fn();

describe('DetailViewDatepicker component', () => {
  const config = {
    title: 'Label',
    name: 'loremIpsum',
    handleUpdate,
    setFormikValue,
    formikSubmit,
    error: '',
    dataTestId: 'test',
  };

  it('Should renders default', () => {
    render(<DetailViewDatepicker {...config} />);

    const datePicker = screen.getByTestId('test-datefield');
    expect(datePicker).toBeTruthy();

    const field = screen.getByRole('textbox');
    expect(field).toHaveValue('');
  });

  it('Should renders with default date', () => {
    render(
      <DetailViewDatepicker
        {...config}
        value="15/09/1989"
        datepickerProps={{ minDate: new Date(1989, 1, 1) }}
      />
    );
    const field = screen.getByRole('textbox');
    expect(field).toHaveValue('15/09/1989');
  });

  it('Should renders readonly with default date', () => {
    render(
      <DetailViewDatepicker
        {...config}
        isReadOnly
        value="15/09/1989"
        dataTestId="test"
        datepickerProps={{ minDate: new Date('1989/01/01') }}
      />
    );
    const field = screen.getByTestId('test-datefield-readonly');
    expect(field).toHaveTextContent('15/09/1989');
  });

  it('Should renders datepicker for date of birth', () => {
    render(
      <DetailViewDatepicker {...config} datepickerProps={{ isDob: true }} />
    );
    const datePicker = screen.getByTestId('test-datefield');
    const datePickerIcon = within(datePicker).getByRole('button');

    expect(datePicker).toBeTruthy();
    expect(datePickerIcon).toBeTruthy();
  });

  it('Should renders datepicker for date of birth with default value', () => {
    const props = {
      title: 'Label',
      name: 'loremIpsum',
      setFormikValue,
      error: '',
      dataTestId: 'test',
    };
    render(
      <DetailViewDatepicker
        {...props}
        datepickerProps={{ isDob: true }}
        value="15/09/1989"
      />
    );
    const field = screen.getByRole('textbox');
    expect(field).toHaveValue('15/09/1989');
  });

  it('Should handleUpdate to be called with correct value', async () => {
    render(
      <DetailViewDatepicker
        {...config}
        value="01/06/2022"
        datepickerProps={{ minDate: new Date('2022/06/01') }}
      />
    );
    const datePicker = screen.getByTestId('test-datefield');
    const datePickerIcon = within(datePicker).getByRole('button');
    await userEvent.click(datePickerIcon);

    const calendar = screen.getByRole('tooltip');
    expect(calendar).toBeTruthy();

    const days = within(calendar).getAllByRole('option');
    await userEvent.click(days[2]);

    expect(setFormikValue).toHaveBeenCalled();
    expect(formikSubmit).toHaveBeenCalled();

    await waitFor(() => {
      const field = screen.getByRole('textbox');
      expect(field).toHaveValue('03/06/2022');
    });
  });

  it('should render asterisk when enabled', async () => {
    render(
      <DetailViewDatepicker
        {...config}
        value="01/06/2022"
        datepickerProps={{ minDate: new Date('2022/06/01') }}
        showAsterisk
      />
    );

    await waitFor(() => {
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  it('should call function onChange when handleUpdate is passed', async () => {
    render(
      <DetailViewDatepicker
        title="label"
        name="loremIpsum"
        dataTestId="test"
        showAsterisk
        handleUpdate={handleUpdate}
      />
    );

    const datePicker = screen.getByTestId('test-datefield');
    const input = datePicker.getElementsByTagName('input')[0];

    expect(datePicker).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, '04/02/2026');
    await userEvent.tab();

    await waitFor(() => {
      // DetailViewDatepicker delegates to Datepicker, which may reformat the value;
      // the important behavior here is that handleUpdate is called with a Date.
      expect(handleUpdate).toHaveBeenCalledTimes(1);
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          loremIpsum: expect.any(Date),
        })
      );
    });
  });

  it('should call function onChange when handleUpdate is passed for DOB', async () => {
    render(
      <DetailViewDatepicker
        {...config}
        setFormikError={setFormikError}
        name="dateOfBirth"
        isDob
      />
    );

    const datePicker = screen.getByTestId('test-datefield');
    const input = datePicker.getElementsByTagName('input')[0];

    expect(datePicker).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, '03/02/1990');
    await userEvent.tab();
    await waitFor(() => {
      expect(input).toHaveValue('03/02/1990');
    });
    await userEvent.clear(input);
    await userEvent.type(input, '03/02/2023');
    await userEvent.tab();
    await waitFor(() => {
      expect(setFormikError).toHaveBeenCalledWith(
        'dateOfBirth',
        'errors.invalidAgeUnder'
      );
    });
  });
});
