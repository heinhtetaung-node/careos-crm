import userEvent from '@testing-library/user-event';
import { add, sub, format } from 'date-fns';
import React from 'react';

import {
  contractDetailsException,
  contractHandlerException,
} from '__mocks__/handlers/leadHandler';
import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { formatSatangToBaht } from 'utils/currency';

import CreateContractPage from '.';

Object.defineProperty(window, 'location', {
  get() {
    return {
      href: 'https://localhost:3030/leads/1a107226-6f37-4ceb-94bc-a352b89c063b',
    };
  },
});

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('Create Contract Page', () => {
  const actionButton = 'create-contract-button';

  beforeEach(() => {
    mockUseFlags();
  });

  it.skip('should go back to leadDetailPage if the GoBack button is pressed.', async () => {
    render(<CreateContractPage />);
    const backButton = screen.getByTestId('back-button');

    await waitFor(() => {
      expect(backButton).toBeInTheDocument();
      userEvent.click(backButton);
    });

    await waitFor(() =>
      expect(window.location.pathname).toBe(
        '/leads/1a107226-6f37-4ceb-94bc-a352b89c063b'
      )
    );
  });

  it('should show a NotFound component if the request returns an error.', async () => {
    server.use(contractDetailsException);
    render(<CreateContractPage />);

    await waitFor(() =>
      expect(screen.getByTestId('not-found-wrapper')).toBeInTheDocument()
    );
  });

  it.skip('should enable button if all fields are valid', async () => {
    render(<CreateContractPage />);
    expect(screen.getByTestId(actionButton)).toBeInTheDocument();
    expect(screen.getByTestId(actionButton)).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByTestId('policy-holder-id-card')).toBeInTheDocument()
    );
    expect(screen.getByTestId('endDate-datefield')).toBeInTheDocument();

    const firstMonthInstallment = screen.getByTestId('firstMonthInstallment');
    const endDateContainer = screen.getByTestId('endDate-datefield');

    const endDate = endDateContainer.getElementsByTagName('input')[0];

    await waitFor(() => {
      expect(endDate).toHaveValue(
        format(sub(add(new Date(), { years: 1 }), { days: 2 }), 'dd/MM/yyyy')
      );
      expect(firstMonthInstallment).toHaveTextContent('1,958.08');

      expect(screen.getByTestId(actionButton)).toBeEnabled();
    });
  });

  it.skip('should open success dialog and can copy text when click Create Payment button.', async () => {
    render(<CreateContractPage />);
    expect(screen.getByTestId(actionButton)).toBeInTheDocument();
    expect(screen.getByTestId(actionButton)).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByTestId('policy-holder-id-card')).toBeInTheDocument();
      expect(screen.getByTestId('endDate-datefield')).toBeInTheDocument();
    });

    jest.spyOn(navigator.clipboard, 'writeText');
    const createPaymentBtn = screen.getByTestId(actionButton);

    await waitFor(() => {
      expect(createPaymentBtn).toBeInTheDocument();
      expect(createPaymentBtn).toBeEnabled();
    });

    userEvent.click(createPaymentBtn);

    await waitFor(() => {
      expect(screen.getByTestId('success-dialog')).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId('copy-button'));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  // TODO: Fix me, i'm wrong test
  it.skip('should close dialog if click close button', async () => {
    render(<CreateContractPage />);
    expect(screen.getByTestId(actionButton)).toBeInTheDocument();
    expect(screen.getByTestId(actionButton)).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByTestId('policy-holder-id-card')).toBeInTheDocument();
      expect(screen.getByTestId('endDate-datefield')).toBeInTheDocument();
    });

    const createPaymentBtn = screen.getByTestId(actionButton);

    await waitFor(() => {
      expect(createPaymentBtn).toBeInTheDocument();
      expect(createPaymentBtn).toBeEnabled();
    });

    userEvent.click(createPaymentBtn);

    await waitFor(() => {
      expect(screen.getByTestId('success-dialog')).toBeInTheDocument();
    });

    const successDialog = screen.getByTestId('success-dialog');
    userEvent.click(screen.getByTestId('close-btn'));
    await waitFor(() => {
      expect(successDialog).not.toBeInTheDocument();
    });
  });

  // TODO: Fix me, i'm wrong test
  it.skip('should open error dialog and can click try again when click Create Payment button.', async () => {
    render(<CreateContractPage />);
    server.use(contractHandlerException);
    await waitFor(() => {
      expect(screen.getByTestId(actionButton)).toBeInTheDocument();
      expect(screen.getByTestId(actionButton)).toBeDisabled();
      expect(screen.getByTestId('policy-holder-id-card')).toBeInTheDocument();
      expect(screen.getByTestId('endDate-datefield')).toBeInTheDocument();
    });

    const createPaymentBtn = screen.getByTestId(actionButton);

    const firstMonthInstallmentContainer = screen.getByTestId(
      'firstMonthInstallment'
    );

    const firstMonthInstallment =
      firstMonthInstallmentContainer.getElementsByTagName('input')[0];

    userEvent.clear(firstMonthInstallment);
    userEvent.type(firstMonthInstallment, '10');

    await waitFor(() => {
      expect(createPaymentBtn).toBeInTheDocument();
      expect(createPaymentBtn).toBeEnabled();
    });

    userEvent.click(createPaymentBtn);

    await waitFor(() => {
      expect(screen.getByTestId('error-dialog')).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId('tryagain-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('error-dialog')).toBeInTheDocument();
    });
  });

  it.skip('should display the appropriate for first and following month installments for payment option', async () => {
    render(<CreateContractPage />);
    await waitFor(() => {
      const firstMonthInstallment = screen.getByTestId('firstMonthInstallment');

      expect(firstMonthInstallment).toHaveTextContent(
        formatSatangToBaht(195808).toString()
      );

      const followingMonthsInstallment = screen.getByTestId(
        'followingMonthsInstallment'
      );
      expect(followingMonthsInstallment).toHaveTextContent(
        formatSatangToBaht(195807).toString()
      );
    });
  });
});
