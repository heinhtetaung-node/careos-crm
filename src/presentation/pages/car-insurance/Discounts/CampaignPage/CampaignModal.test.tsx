import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import {
  useCreateCampaignMutation,
  useEditCampaignMutation,
} from 'data/slices/discountSlice';

import CampaignModal from './CampaignModal';

var mockShowErrorSnackbar: jest.Mock;

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

const mockCloseFn = jest.fn();
const mockSuccessFn = jest.fn();
const mockCreateCampaign = useCreateCampaignMutation as jest.Mock;
const mockEditCampaign = useEditCampaignMutation as jest.Mock;
var mockShowErrorSnackbar: jest.Mock;

jest.mock('data/slices/discountSlice', () => ({
  ...jest.requireActual('data/slices/discountSlice'),
  useCreateCampaignMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { data: {} }]),
  useEditCampaignMutation: jest.fn().mockReturnValue([jest.fn(), { data: {} }]),
}));
jest.mock('utils/snackbar', () => {
  mockShowErrorSnackbar = jest.fn();
  return jest
    .fn()
    .mockReturnValue({ showErrorSnackbar: mockShowErrorSnackbar });
});

describe('Testing Campaign Modal', () => {
  beforeEach(() => {
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CampaignModal
          campaignData={null}
          handleSuccess={mockSuccessFn}
          handleClose={mockCloseFn}
        />
      </MuiPickersUtilsProvider>,
      {
        initialState,
      }
    );
  });

  it('should show Campaign modal', () => {
    expect(screen.getByTestId('discount-campaign-modal')).toBeInTheDocument();
  });

  it('should close the modal on click of cancel button', async () => {
    await userEvent.click(
      screen.getAllByRole('button', { name: 'text.cancelButton' })[0]
    );

    expect(mockCloseFn).toHaveBeenCalled();
  });
});

const renderAndInputValues = async (data: any = null) => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

  render(
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <CampaignModal
        campaignData={data}
        handleSuccess={mockSuccessFn}
        handleClose={mockCloseFn}
      />
    </MuiPickersUtilsProvider>,
    {
      initialState,
    }
  );

  const name = screen.getByTestId('input-campaignCode');
  const discountPercent = screen.getByTestId('input-discountPercentage');
  const description = screen.getByTestId('input-description');

  await userEvent.type(name, 'ABC');
  await userEvent.click(screen.getAllByRole('button')[0]);
  await userEvent.click(screen.getAllByRole('button')[12]);

  await userEvent.click(screen.getAllByRole('button')[1]);
  await userEvent.click(screen.getAllByRole('button')[13]);

  await userEvent.type(discountPercent, '12');
  await userEvent.type(description, 'demo description');
};

describe.skip('Testing CreateCampaign & EditCampaign with responses', () => {
  it('should create campaign with success', async () => {
    mockCreateCampaign.mockReturnValue([
      jest.fn(),
      { data: { name: 'asd' }, isSuccess: true },
    ]);
    renderAndInputValues();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));
    expect(mockCloseFn).toHaveBeenCalled();
    expect(mockSuccessFn).toHaveBeenCalled();
  });

  it('should create Campaign with error code 3', async () => {
    mockCreateCampaign.mockReturnValue([
      jest.fn(),
      { error: { data: { message: 'Error', code: 3 } }, isError: true },
    ]);
    renderAndInputValues();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.errorMessage');
  });

  it('should edit campaign with success', async () => {
    mockEditCampaign.mockReturnValue([
      jest.fn(),
      { data: { name: 'asd' }, isSuccess: true },
    ]);
    renderAndInputValues({
      ...DiscountMockData.campaigns[0],
      approver: 'manager',
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));
    expect(mockCloseFn).toHaveBeenCalled();
    expect(mockSuccessFn).toHaveBeenCalled();
  });

  it('should call edit Campaign with error code 3', async () => {
    mockEditCampaign.mockReturnValue([
      jest.fn(),
      { error: { data: { message: 'Error', code: 3 } }, isError: true },
    ]);
    renderAndInputValues({
      ...DiscountMockData.campaigns[0],
      approver: 'manager',
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.errorMessage');
  });
});
