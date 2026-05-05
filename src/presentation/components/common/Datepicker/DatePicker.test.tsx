import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import Datepicker from '.';

const handerDateChange = jest.fn((value) => value);
beforeEach(() => jest.clearAllMocks());

test('Should render input field with calendar icon to open datepicker', () => {
  render(<Datepicker onChange={handerDateChange} />);
  const datePicker = screen.getByTestId('date-picker');
  const datePickerIcon = within(datePicker).getByRole('button');
  const textField: HTMLInputElement = datePicker.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(datePicker).toBeTruthy();
  expect(datePickerIcon).toBeTruthy();
  expect(textField).not.toHaveValue();
});

test('Should show default format in textfield when passing dateValue', () => {
  render(
    <Datepicker
      onChange={handerDateChange}
      dateValue="03/06/2022"
      minDate={new Date(2021, 5, 17)}
    />
  );
  const datePicker = screen.getByTestId('date-picker');
  const textField: HTMLInputElement = datePicker.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField.value).toBe('03/06/2022');
});

describe('Should onChange is triggered', () => {
  it('Should change month with next month button', async () => {
    render(
      <Datepicker
        dateValue="17/05/2022"
        minDate={new Date(2021, 5, 17)}
        maxDate={new Date(2022, 5, 17)}
        onChange={handerDateChange}
      />
    );
    const datePicker = screen.getByTestId('date-picker');
    const datePickerIcon = within(datePicker).getByRole('button');
    await userEvent.click(datePickerIcon);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const nextMonthBtn = allButtons[1];
    await userEvent.click(nextMonthBtn);

    jest.clearAllMocks();

    const days = screen.getAllByRole('option');
    await userEvent.click(days[0]);

    expect(handerDateChange.mock.results[0].value.toString()).toMatch(
      /Jun 01 2022/
    );
  });

  it('Should next month button disabled if reaches maxDate', async () => {
    render(
      <Datepicker
        dateValue="17/06/2022"
        minDate={new Date(2021, 5, 17)}
        maxDate={new Date(2022, 5, 17)}
        onChange={handerDateChange}
      />
    );
    const datePicker = screen.getByTestId('date-picker');
    const datePickerIcon = within(datePicker).getByRole('button');
    await userEvent.click(datePickerIcon);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const nextMonthBtn = allButtons[1];
    expect(nextMonthBtn.getAttribute('disabled')).not.toBeNull();
  });

  it('Should change month with prev month button', async () => {
    render(
      <Datepicker
        dateValue="17/06/2022"
        minDate={new Date(2021, 5, 17)}
        maxDate={new Date(2022, 5, 17)}
        onChange={handerDateChange}
      />
    );
    const datePicker = screen.getByTestId('date-picker');
    const datePickerIcon = within(datePicker).getByRole('button');
    await userEvent.click(datePickerIcon);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const prevMonthBtn = allButtons[0];

    jest.clearAllMocks();

    await userEvent.click(prevMonthBtn);
    const days = screen.getAllByRole('option');
    await userEvent.click(days[0]);

    expect(handerDateChange.mock.results[0].value.toString()).toMatch(
      /May 01 2022/
    );
  });

  it('Should change to maxDate when clicking to today button', async () => {
    render(
      <Datepicker
        minDate={new Date(2021, 5, 17)}
        maxDate={new Date(2022, 5, 17)}
        onChange={handerDateChange}
      />
    );
    const datePicker = screen.getByTestId('date-picker');
    const datePickerIcon = within(datePicker).getByRole('button');
    await userEvent.click(datePickerIcon);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const todayBtn = allButtons[2];

    jest.clearAllMocks();

    await userEvent.click(todayBtn);

    expect(handerDateChange.mock.results[0].value.toString()).toMatch(
      /Jun 17 2022/
    );
  });
});

test('Should show correct calendar screen position with default value', async () => {
  render(
    <Datepicker
      dateValue="17/11/2021"
      minDate={new Date(2021, 5, 17)}
      maxDate={new Date(2022, 5, 17)}
      onChange={handerDateChange}
    />
  );
  const datePicker = screen.getByTestId('date-picker');
  const datePickerIcon = within(datePicker).getByRole('button');
  await userEvent.click(datePickerIcon);

  expect(await screen.queryAllByText('November')).toBeTruthy();
  expect(await screen.queryAllByText('2021')).toBeTruthy();
});

// Date of birth picker test cases
test('Should render input field with calendar icon to open datepicker', () => {
  render(<Datepicker isDob onChange={handerDateChange} />);
  const DOBPicker = screen.getByTestId('dob-picker');
  const DOBPickerIcon = within(DOBPicker).getByRole('button');
  const textField: HTMLInputElement = DOBPicker.querySelector(
    'input'
  ) as HTMLInputElement;

  expect(DOBPicker).toBeTruthy();
  expect(DOBPickerIcon).toBeTruthy();
  expect(textField).not.toHaveValue();
});

test('Should show year picker popper when calendar icon is clicked', async () => {
  render(<Datepicker isDob onChange={handerDateChange} />);
  const DOBPicker = screen.getByTestId('dob-picker');
  const DOBPickerIcon = within(DOBPicker).getByRole('button');
  await userEvent.click(DOBPickerIcon);

  const yearPicker = screen.getByRole('contentinfo');
  expect(yearPicker).toBeTruthy();
  expect(within(yearPicker).getAllByRole('button').length).toBe(101);
});

describe('Should onEveryChange is triggered', () => {
  // TODO: Fix incorrect test
  it.skip('Should select year and show month picker', async () => {
    render(
      <Datepicker
        isDob
        onChange={handerDateChange}
        onEveryChange={handerDateChange}
        minDate={new Date('2023/01/01')}
      />
    );
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    expect(handerDateChange).toHaveBeenCalled();
    expect(handerDateChange.mock.results[0].value).toBeTruthy();
    expect(handerDateChange.mock.results[0].value.toString()).toMatch(/2023/);

    const monthPicker = screen
      .getByRole('tooltip')
      .querySelector('.react-datepicker__month-wrapper');
    expect(monthPicker).toBeTruthy();
  });

  // TODO: Fix incorrect test
  it.skip('Should select month and show date picker', async () => {
    render(
      <Datepicker
        isDob
        onChange={handerDateChange}
        onEveryChange={handerDateChange}
        minDate={new Date('2023/01/01')}
        maxDate={new Date('2024/01/01')}
      />
    );
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    jest.clearAllMocks();

    const months = screen.getAllByRole('option');
    expect(months.length).toBe(12);
    const selectedMonth = months.findIndex((i) => i.textContent === 'Dec');
    await userEvent.click(months[selectedMonth]);

    expect(
      screen.getByRole('listbox', { name: 'month 2023-12' })
    ).toBeInTheDocument();
    const datePicker = screen
      .getByRole('tooltip')
      .querySelector('.react-datepicker__week');
    expect(datePicker).toBeTruthy();
  });

  it('Should select date and close popper with correct input value', async () => {
    render(
      <Datepicker
        isDob
        minDate={new Date('1922/01/01')}
        onChange={handerDateChange}
        onEveryChange={handerDateChange}
      />
    );
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    const months = screen.getAllByRole('option');
    expect(months.length).toBe(12);
    await userEvent.click(months[11]);

    expect(handerDateChange).toHaveBeenCalled();

    jest.clearAllMocks();

    const days = screen.getAllByRole('option');
    expect(days.length).toBeGreaterThan(27);
    await userEvent.click(days[1]);

    const textField: HTMLInputElement = DOBPicker.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(textField.value).toBe('02/12/1922');
  });

  it('Should change month with next month button', async () => {
    render(
      <Datepicker
        isDob
        minDate={new Date('1922/01/01')}
        onChange={handerDateChange}
        onEveryChange={handerDateChange}
      />
    );
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    const months = screen.getAllByRole('option');
    expect(months.length).toBe(12);
    await userEvent.click(months[10]);

    expect(handerDateChange).toHaveBeenCalled();

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const nextMonthBtn = allButtons[2];
    await userEvent.click(nextMonthBtn);

    jest.clearAllMocks();

    const days = screen.getAllByRole('option');
    await userEvent.click(days[1]);

    const textField: HTMLInputElement = DOBPicker.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(textField.value).toBe('02/12/1922');
  });

  it('Should not change month (next button) if next month is in the future', async () => {
    render(<Datepicker isDob onChange={handerDateChange} />);
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[yearButtons.length - 1]);

    const months = screen.getAllByRole('option');
    const enabledMonths = months.filter(
      (monthButton) => !monthButton.className.includes('disabled')
    );
    await userEvent.click(enabledMonths[enabledMonths.length - 1]);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const nextMonthBtn = allButtons[2];
    expect(nextMonthBtn.getAttribute('disabled')).not.toBeNull();
  });

  it('Should change month with prev month button', async () => {
    render(
      <Datepicker
        isDob
        minDate={new Date(1922, 2, 2)}
        onChange={handerDateChange}
      />
    );
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    const months = screen.getAllByRole('option');
    expect(months.length).toBe(12);
    await userEvent.click(months[11]);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const prevMonthBtn = allButtons[1];

    jest.clearAllMocks();

    await userEvent.click(prevMonthBtn);
    const days = screen.getAllByRole('option');
    await userEvent.click(days[0]);

    expect(handerDateChange.mock.results[0].value.toString()).toMatch(
      /Nov 01 1922/
    );
  });

  it('Should show year picker when click arrow down button', async () => {
    render(<Datepicker isDob onChange={handerDateChange} />);
    const DOBPicker = screen.getByTestId('dob-picker');
    const DOBPickerIcon = within(DOBPicker).getByRole('button');
    await userEvent.click(DOBPickerIcon);

    const yearPicker = screen.getByRole('contentinfo');
    const yearButtons = within(yearPicker).getAllByRole('button');
    await userEvent.click(yearButtons[0]);

    const months = screen.getAllByRole('option');
    expect(months.length).toBe(12);
    await userEvent.click(months[11]);

    const allButtons = within(screen.getByRole('tooltip')).getAllByRole(
      'button'
    );
    const showYearBtn = allButtons[0];
    await userEvent.click(showYearBtn);

    const yearPickerShow = screen.getByRole('contentinfo');
    expect(yearPickerShow).toBeTruthy();
    expect(within(yearPickerShow).getAllByRole('button').length).toBe(101);
  });
});

test('Should show correct date default format in textfield when passing dateValue', async () => {
  render(
    <Datepicker isDob onChange={handerDateChange} dateValue="12/12/2009" />
  );
  const DOBPicker = screen.getByTestId('dob-picker');

  await waitFor(() => {
    const textField: HTMLInputElement = DOBPicker.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(textField.value).toBe('12/12/2009');
  });
});

test('Should show correct date with custom format in textfield', () => {
  render(
    <Datepicker
      isDob
      onChange={handerDateChange}
      dateValue={new Date(2009, 9, 21)}
      dateFormat="yyyy/MM/dd"
      maskedFormat={['Y', 'm', 'd']}
    />
  );
  const DOBPicker = screen.getByTestId('dob-picker');
  const textField: HTMLInputElement = DOBPicker.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField.value).toBe('2009/10/21');
});

test('Should reset to vaild date if selected date is greater than max date.', () => {
  render(
    <Datepicker
      isDob
      onChange={handerDateChange}
      dateValue={new Date(9999, 9, 21)}
      maxDate={new Date(2022, 9, 21)}
      dateFormat="yyyy/MM/dd"
      maskedFormat={['Y', 'm', 'd']}
    />
  );
  const DOBPicker = screen.getByTestId('dob-picker');
  const textField: HTMLInputElement = DOBPicker.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField.value).toBe('2022/10/21');
});

test('Should reset to vaild date if selected date is smaller than min date.', () => {
  render(
    <Datepicker
      isDob
      onChange={handerDateChange}
      dateValue={new Date(1111, 9, 21)}
      minDate={new Date(1922, 9, 21)}
      dateFormat="yyyy/MM/dd"
      maskedFormat={['Y', 'm', 'd']}
    />
  );
  const DOBPicker = screen.getByTestId('dob-picker');
  const textField: HTMLInputElement = DOBPicker.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField.value).toBe('1922/10/21');
});

test('Should reset to vaild date if input date month/day is large than max date.', async () => {
  render(
    <Datepicker
      isDob
      onChange={handerDateChange}
      dateValue="1922/31/12"
      minDate={new Date(1922, 1, 1)}
      maxDate={new Date(2022, 6, 14)}
      dateFormat="yyyy/MM/dd"
      maskedFormat={['Y', 'm', 'd']}
    />
  );
  const DOBPicker = screen.getByTestId('dob-picker');
  const DOBPickerIcon = within(DOBPicker).getByRole('button');
  await userEvent.click(DOBPickerIcon);

  const yearPicker = screen.getByRole('contentinfo');
  const yearButtons = within(yearPicker).getAllByRole('button');
  await userEvent.click(yearButtons[yearButtons.length - 1]);

  const textField: HTMLInputElement = DOBPicker.querySelector(
    'input'
  ) as HTMLInputElement;
  expect(textField.value).toBe('2022/07/14');
});

test('Should not show date picker if input ref is not exsits.', async () => {
  render(
    <Datepicker
      isDob
      onChange={handerDateChange}
      textFieldProps={{ inputRef: null }}
    />
  );
  const DOBPicker = screen.getByTestId('dob-picker');
  const DOBPickerIcon = within(DOBPicker).getByRole('button');
  await userEvent.click(DOBPickerIcon);

  expect(screen.queryByRole('contentinfo')).toBeNull();
});
