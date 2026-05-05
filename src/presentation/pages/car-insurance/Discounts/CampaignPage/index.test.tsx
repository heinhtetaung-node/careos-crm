/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';
import {
  useActivateCampaignMutation,
  useDeactivateCampaignMutation,
} from 'data/slices/discountSlice';

import CampaignModal from './CampaignModal';

import DiscountCampaignPage from '.';

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

const mockActivateCampaign = useActivateCampaignMutation as jest.Mock;
const mockDeactivateCampaign = useDeactivateCampaignMutation as jest.Mock;

jest.mock('data/slices/discountSlice', () => ({
  ...jest.requireActual('data/slices/discountSlice'),
  useActivateCampaignMutation: jest
    .fn()
    .mockReturnValue([
      jest.fn(),
      { data: { name: 'campaign/name' }, isLoading: false },
    ]),
  useDeactivateCampaignMutation: jest
    .fn()
    .mockReturnValue([
      jest.fn(),
      { data: { name: 'campaign/name' }, isLoading: false },
    ]),
}));

describe.skip('Testing Discount Campaign Page', () => {
  beforeEach(() => {
    render(<DiscountCampaignPage />, { initialState });
  });

  it('should render CampaignPage', () => {
    expect(screen.getByTestId('discount-campaign-page')).toBeInTheDocument();
  });
  it('should show create campaign modal on click of a button', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create text.campaign' })
    );
    expect(screen.getByTestId('discount-campaign-modal')).toBeInTheDocument();
  });
  it('should close the modal on click of cancel button', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create text.campaign' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
    await waitFor(() => {
      expect(screen.queryByTestId('discount-campaign-modal')).toBeNull();
    });
  });
  it('should close the modal on click of close icon', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.create text.campaign' })
    );
    await userEvent.click(screen.getByTestId('close-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('discount-campaign-modal')).toBeNull();
    });
  });
});

describe('Testing Activate/Deactivate Campaign', () => {
  beforeEach(async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns`,
        () =>
          HttpResponse.json({
            campaigns: DiscountMockData.campaigns,
            nextPageToken: DiscountMockData.nextPageToken,
          })
      )
    );
    render(<DiscountCampaignPage />, { initialState });
    await waitForElementToBeRemoved(
      screen.getAllByTestId('data-table-skeleton')
    );
    await waitFor(() => {
      expect(screen.queryAllByTestId('data-table-skeleton').length).toBe(0);
    });
  });
  it('should de-activate campaign on click of toggle button', async () => {
    const toggleBtn = screen.getAllByTestId('discount-toggle-button');
    expect(toggleBtn).toHaveLength(2);

    await userEvent.click(toggleBtn[0].firstElementChild?.firstElementChild!);
    expect(mockDeactivateCampaign).toHaveBeenCalled();
  });
  it('should activate campaign on click of toggle button', async () => {
    const toggleBtn = screen.getAllByTestId('discount-toggle-button');
    expect(toggleBtn).toHaveLength(2);

    await userEvent.click(toggleBtn[1].firstElementChild?.firstElementChild!);
    expect(mockActivateCampaign).toHaveBeenCalled();
  });
});

describe('Testing Campaign Modal', () => {
  const mockCloseFn = jest.fn();
  const mockSuccessFn = jest.fn();

  beforeEach(() => {
    render(
      <CampaignModal
        campaignData={null}
        handleClose={mockCloseFn}
        handleSuccess={mockSuccessFn}
      />
    );
  });
  it('should show campaign modal', () => {
    expect(screen.getByTestId('discount-campaign-modal')).toBeInTheDocument();
  });
  it('should render the value if passed as props', async () => {
    const inputs = screen.getAllByRole('textbox');

    await userEvent.type(inputs[0], 'ABC');
    expect(inputs[0].getAttribute('value')).toBe('ABC');
  });
  it('should close the modal on click of cancel button', async () => {
    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );

    expect(mockCloseFn).toHaveBeenCalledTimes(1);
  });
  it('should update the values and trigger submit on click of save button ', async () => {
    const campaignCode = screen.getByTestId('input-campaignCode');
    const startDate = screen.getByTestId('input-startDate');
    const endDate = screen.getByTestId('input-endDate');
    const discountPercentage = screen.getByTestId('input-discountPercentage');

    await userEvent.type(campaignCode, 'ABC');
    await userEvent.type(startDate, '12/12/2022');
    await userEvent.type(endDate, '13/12/2022');
    await userEvent.type(discountPercentage, '12');

    await userEvent.click(screen.getByRole('button', { name: 'text.save' }));
    expect(mockCloseFn).toHaveBeenCalledTimes(1);
  });
});

describe('Testing Filters', () => {
  beforeEach(async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/discount/v1alpha1/campaigns`,
        () =>
          HttpResponse.json({
            campaigns: DiscountMockData.campaigns,
            nextPageToken: DiscountMockData.nextPageToken,
          })
      )
    );
    render(<DiscountCampaignPage />, { initialState });
    expect(screen.getByTestId('discount-campaign-page')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryAllByTestId('data-table-skeleton').length).toBe(0);
    });
  });
  it('should filter and render the data accordingly', async () => {
    const campaignTypeElem = screen.getByTestId(
      'muiSelect-selectValue'
    ).firstElementChild!;
    const submitBtn = screen.getByTestId('submit-btn');

    await userEvent.click(campaignTypeElem);
    await userEvent.click(screen.getAllByRole('option')[1]);

    await userEvent.type(
      screen.getByTestId('input-inputValue').firstElementChild!,
      'Campaign1y3t'
    );
    expect(submitBtn).toBeEnabled();
    await userEvent.click(submitBtn);

    await waitFor(() =>
      expect(screen.queryAllByTestId('data-table-skeleton')).toHaveLength(0)
    );
    await waitFor(() => {
      expect(screen.getAllByRole('cell')[2]).toHaveTextContent('Campaign1y3t');
    });
  });
  it.skip('should reset the filter if clicked on reset button', async () => {
    const campaignTypeElem = screen.getByTestId(
      'muiSelect-selectValue'
    ).firstElementChild!;

    await userEvent.click(campaignTypeElem);
    await userEvent.click(screen.getAllByRole('option')[1]);

    await userEvent.click(screen.getByTestId('reset-btn'));

    expect(campaignTypeElem).toHaveTextContent('text.select');
  });
});
