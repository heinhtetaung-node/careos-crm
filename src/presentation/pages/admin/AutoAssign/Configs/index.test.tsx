/* eslint-disable no-constructor-return */
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { AutoAssignmentLead } from 'mock-data/ImportLead.mock';
import Controls from 'presentation/components/controls/Control';

import {
  getDefaultEffectiveDate,
  filterFields,
  addFilterToURI,
} from './helper';

import AutoAssignConfigsPage from '.';

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

describe('Testing Auto Assign Config Page', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/autoassignments`,
        () =>
          HttpResponse.json({
            assignments: AutoAssignmentLead,
            total: AutoAssignmentLead.length,
          })
      )
    );
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <AutoAssignConfigsPage />
      </MuiPickersUtilsProvider>,
      {
        initialState,
      }
    );
  });

  it('should render AutoAssign Component', () => {
    expect(screen.getByTestId('admin-sales-page')).toBeInTheDocument();
  });

  it('should popup settings modal and close it by cancel button', async () => {
    await userEvent.click(screen.getByTestId('test-edit-btn'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
  });

  it('should popup settings modal and close it by close button', async () => {
    await userEvent.click(screen.getByTestId('test-edit-btn'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('close-button'));
  });

  it('should popup status modal', async () => {
    await waitFor(() =>
      expect(screen.getByTestId('test-status-btn')).toBeInTheDocument()
    );
    userEvent.click(screen.getByTestId('test-status-btn'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
  });

  it('should update the filter URI along with table', async () => {
    const dateElem = screen.getAllByRole('textbox')[2];
    await waitFor(async () => {
      expect(dateElem).toBeInTheDocument();
    });

    await userEvent.type(dateElem, '05/10/2022');

    await waitFor(() => expect(screen.getByTestId('submit-btn')).toBeEnabled());

    await userEvent.click(screen.getByTestId('submit-btn'));

    await waitFor(() => {
      const tr = document.getElementsByTagName('tr');
      expect(tr[1].children[6].innerHTML).toBe('17/09/2022');
    });
  });
});

describe('Testing helpers', () => {
  it('should return keyboradPicker if flag is enabled', () => {
    const fields = filterFields({}, jest.fn());
    expect(fields[fields.length - 1]).toEqual({
      InputComponent: Controls.KeyBoardDatePicker,
      inputProps: {
        className: undefined,
        filterType: 'summary',
        fixedLabel: true,
        label: 'menu.autoAssignment.effectiveDate',
        name: 'effectiveDate',
        placeholder: 'text.enterEffectiveDate',
        responsive: { md: 3, xs: 6 },
      },
    });
  });

  it('should return appropriate URI', () => {
    const url = addFilterToURI({
      displayName: [{ name: 'team id' }],
      name: [{ key: 'userA' }],
      status: '1',
      effectiveDate: new Date('2023-02-16T06:20:00.000Z'),
    });

    expect(url).toBe(
      'team.name in ("team id") user.name in ("userA") config.absent=true config.effectiveDate="2023-02-16"'
    );
  });
});

describe('getDefaultEffectiveDate', () => {
  const ORIGINAL_DATE = global.Date;

  function setTime(mockDate: string | number | Date) {
    let constantDate = new Date(mockDate);

    global.Date = class extends Date {
      constructor(...args: any[]) {
        super();
        if (args.length) {
          constantDate = new ORIGINAL_DATE(args[0]);
        }
        return constantDate;
      }
    } as any;
  }

  afterAll(() => {
    // Restore the original Date constructor after the tests
    global.Date = ORIGINAL_DATE;
  });

  it("should return today's date if time is before 19:00:00", () => {
    setTime(new Date(1_665_050_100_000));
    expect(getDefaultEffectiveDate()).toBe('2022-10-06');
  });

  it("should return tomorrow's date if time is after 19:05:00", () => {
    setTime(new Date(1_665_083_100_000));
    expect(getDefaultEffectiveDate()).toBe('2022-10-07');
  });
});
