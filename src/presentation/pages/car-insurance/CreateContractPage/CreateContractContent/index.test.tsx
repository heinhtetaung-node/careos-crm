import { MuiThemeProvider } from '@material-ui/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React from 'react';

import { mockLeadPaymentInformation } from 'mock-data/LeadPaymentInformation';
import themes from 'presentation/theme';
import configureMockStore from 'redux-mock-store';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { getPaymentMethod } from 'shared/helper/leadPaymentInformation';
import { PaymentDetail, PaymentOption } from 'shared/types/lead';

import CreateContractContent from '.';
import { Provider } from 'react-redux';
import { PRODUCTS } from 'config/TypeFilter';

jest.mock('presentation/components/common/CustomerInformationSection', () =>
  jest.fn(() => <div />)
);
jest.mock('presentation/components/common/PaymentSelectionSection', () =>
  jest.fn(() => <div />)
);
jest.mock('presentation/components/common/PaymentDetailsSection', () =>
  jest.fn(() => <div />)
);
jest.mock('../QuoteDetailsSection', () =>
  jest.fn(({ data }) => {
    console.log('QuoteDetailsSection data:', data);
    return (
      <div>
        <input
          data-testid="grossVoluntaryPremium"
          value={data?.grossVoluntaryPremium?.toString() ?? ''}
        />
        <input
          data-testid="processingFee"
          value={data?.processingFee?.toString() ?? ''}
        />
        <input
          data-testid="totalPremium"
          value={data?.totalPremium?.toString() ?? ''}
        />
      </div>
    );
  })
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
  paymentOption: 2,
  paymentMethod: 0,
  issuingBank: 0,
  installmentPlan: 0,
  firstMonth: 0,
  followingMonth: 0,
  installmentDate: '',
  endDate: new Date(),
};

const mockStore = configureMockStore();
const store = mockStore({
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: PRODUCTS.CAR_PRODUCT_INSURANCE,
    },
  },
});

const renderWithFormik = (onSubmit = jest.fn()) =>
  render(
    <Provider store={store as any}>
      <MuiThemeProvider theme={themes[0]}>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values) => onSubmit(values)}
        >
          <CreateContractContent
            data={{
              ...mockLeadPaymentInformation,
              carQuoteInformation: {},
              paymentSelections: [
                mockLeadPaymentInformation.paymentSelections[
                  PaymentOption.RABBIT_CARE_INSTALLMENT
                ],
              ],
              paymentOptions: {
                fullPayment: null,
                creditCardInstallment: null,
                rabbitCareInstallment:
                  mockLeadPaymentInformation.paymentOptions
                    .rabbitCareInstallment,
              },
            }}
          />
        </Formik>
      </MuiThemeProvider>
    </Provider>
  );

describe('CreateContractContent', () => {
  // Use paymentOption = 2 for 'rabbitCareInstallment' and only the valid plan (index 0)
  const paymentDetails = getPaymentMethod(
    {
      fullPayment: null,
      creditCardInstallment: null,
      rabbitCareInstallment:
        mockLeadPaymentInformation.paymentOptions.rabbitCareInstallment,
    },
    2, // paymentOption index for 'rabbitCareInstallment'
    0, // paymentMethod index (first in array, "QR_CODE")
    0, // issuingBank index (not used here)
    0 // installmentPlan index (first and only plan: 3 installments)
  ) as PaymentDetail;

  beforeEach(() => {
    mockUseFlags();
  });

  it('should render quote information with pricing engine', () => {
    renderWithFormik();
    expect(paymentDetails).toBeTruthy();
    expect(screen.getByTestId('grossVoluntaryPremium')).toHaveValue('575904');
    expect(screen.getByTestId('processingFee')).toHaveValue(
      paymentDetails.priceSummary.feeAmount.toString()
    );
    expect(screen.getByTestId('totalPremium')).toHaveValue(
      paymentDetails.priceSummary.netPremiumAmount.toString()
    );
  });

  it('should submit firstMonth and followingMonth from pricing engine', async () => {
    const onSubmit = jest.fn();
    renderWithFormik(onSubmit);
    await waitFor(() => {
      expect(screen.getByTestId('create-contract-button')).toBeEnabled();
      userEvent.click(screen.getByTestId('create-contract-button'));
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
