import { MuiThemeProvider } from '@material-ui/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React from 'react';

import {
  mockLeadPaymentInformation,
  mockLeadPaymentInformationChangeOrder,
} from 'mock-data/LeadPaymentInformation';
import themes from 'presentation/theme';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { getPaymentMethod } from 'shared/helper/leadPaymentInformation';
import {
  PaymentDetail,
  PaymentOption,
  QuoteInformation,
} from 'shared/types/lead';
import { satangToBaht } from 'utils/currency';

import CreatePaymentContent from '.';

jest.mock(
  'presentation/components/common/CustomerInformationSection',
  () => 'CustomerInformationSection'
);
jest.mock(
  'presentation/components/common/PaymentSelectionSection',
  () => 'PaymentSelectionSection'
);
jest.mock(
  'presentation/components/common/PaymentDetailsSection',
  () => 'PaymentDetailsSection'
);
jest.mock(
  '../QuoteDetailsSection',
  () =>
    function QuoteDetailsSection({ data }: { data: QuoteInformation }) {
      return (
        <div>
          <input
            data-testid="grossVoluntaryPremium"
            defaultValue={data?.grossVoluntaryPremium}
          />
          <input data-testid="discount" defaultValue={data?.discount} />
          <input data-testid="totalPremium" defaultValue={data?.totalPremium} />
        </div>
      );
    }
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/',
  }),
  useNavigate: jest.fn(),
}));

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn().mockReturnValue('leadId'),
}));

const initialValues = {
  issuingBank: 0,
  paymentOption: PaymentOption.RABBIT_CARE_INSTALLMENT,
  installmentPlan: 0,
  paymentMethod: 0,
  firstMonth: 0,
  followingMonth: 0,
  installmentDate: '',
  endDate: new Date(),
};

const renderWithFormik = (onSubmit = jest.fn()) =>
  render(
    <MuiThemeProvider theme={themes[0]}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => onSubmit(values)}
      >
        <CreatePaymentContent data={mockLeadPaymentInformation} />
      </Formik>
    </MuiThemeProvider>
  );

describe('CreatePaymentContent', () => {
  const paymentDetails = getPaymentMethod(
    mockLeadPaymentInformation.paymentOptions,
    PaymentOption.RABBIT_CARE_INSTALLMENT
  ) as PaymentDetail;

  beforeEach(() => {
    mockUseFlags();
  });

  it('should render quote information with pricing engine', () => {
    renderWithFormik();

    expect(screen.getByTestId('grossVoluntaryPremium')).toHaveValue(
      mockLeadPaymentInformation.quoteInformation.grossVoluntaryPremium.toString()
    );
    expect(screen.getByTestId('totalPremium')).toHaveValue(
      paymentDetails.priceSummary.netPremiumAmount?.toString()
    );
  });

  it('should submit firstMonth and followingMonth from pricing engine', async () => {
    const onSubmit = jest.fn();

    renderWithFormik(onSubmit);

    await waitFor(() => {
      expect(screen.getByTestId('create-payment-button')).toBeEnabled();
      userEvent.click(screen.getByTestId('create-payment-button'));

      const expectedValues = {
        ...initialValues,
        firstMonth: satangToBaht(paymentDetails.priceSummary.initialAmount),
        followingMonth: satangToBaht(
          paymentDetails.priceSummary.subsequentAmount
        ),
      };
      expect(onSubmit).toHaveBeenCalledWith(expectedValues);
    });
  });

  it('should show information correctly in case change order', async () => {
    const onSubmit = jest.fn();

    render(
      <MuiThemeProvider theme={themes[0]}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => onSubmit(values)}
        >
          <CreatePaymentContent data={mockLeadPaymentInformationChangeOrder} />
        </Formik>
      </MuiThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-payment-button')).toBeEnabled();
    });
  });
  it('should show new information correctly in case change order', async () => {
    const onSubmit = jest.fn();

    render(
      <MuiThemeProvider theme={themes[0]}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => onSubmit(values)}
        >
          <CreatePaymentContent data={mockLeadPaymentInformationChangeOrder} />
        </Formik>
      </MuiThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-payment-button')).toBeEnabled();
    });
  });
  it('should show information for direct debit payment method', async () => {
    const onSubmit = jest.fn();
    render(
      <MuiThemeProvider theme={themes[0]}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => onSubmit(values)}
        >
          <CreatePaymentContent
            data={{
              ...mockLeadPaymentInformationChangeOrder,
              packageDetails: {
                ...mockLeadPaymentInformationChangeOrder.packageDetails,
                numberOfInstallments: 3,
                paymentMethod: 'DIRECT_DEBIT',
              },
            }}
          />
        </Formik>
      </MuiThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-payment-button')).toBeEnabled();
    });
  });
});
