import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import * as CONSTANTS from 'shared/constants';
import getEndpoint from 'utils/endpointHelper';

import SelectPackageButton from '.';

const normalPackageData = {
  id: 'packages/1357671',
  insuranceKind: 'both',
  packageSource: 'import',
  customQuoteDetails: null,
};

const customPackageData = {
  id: 'customPackages/f909b384-18b0-463c-990b-0b2ec6118f40',
  insuranceKind: 'both',
  packageSource: 'custom',
  customQuoteDetail: {
    paymentMethod: 'ONLINECARD',
    paymentOption: 'FULL_PAYMENT',
    numberOfInstallments: 1,
  },
};

var mockSnackBar: jest.Mock;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: 'fakeLeadId' }),
  useLocation: jest.fn().mockReturnValue({
    search:
      'id=packages/1357671,customPackages/f909b384-18b0-463c-990b-0b2ec6118f40&insuranceKind=BOTH',
  }),
}));

jest.mock('presentation/redux/actions/ui', () => {
  mockSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockSnackBar,
  };
});

describe('<SelectPackageButton />', () => {
  beforeEach(() => {
    mockSnackBar.mockClear();
  });

  it('should render the component for normal package with discount and payment disabled', () => {
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/fakeLeadId'), () =>
        HttpResponse.json({
          data: {
            checkout: {},
            insuranceKind: 'voluntary',
          },
          status: 'LEAD_STATUS_NEW',
        })
      )
    );
    render(
      <SelectPackageButton
        packageData={normalPackageData as unknown as TransformedPackageType}
        isSelected
      />
    );

    expect(screen.getByTestId('select-package-button')).toBeInTheDocument();
    expect(screen.getByText('packageListing.selected')).toBeInTheDocument();
  });

  it('should render the component for normal package with discount and payment enabled', () => {
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/fakeLeadId'), () =>
        HttpResponse.json({
          data: {
            checkout: {},
            insuranceKind: 'voluntary',
          },
          status: 'LEAD_STATUS_NEW',
        })
      )
    );
    render(
      <SelectPackageButton
        packageData={normalPackageData as unknown as TransformedPackageType}
        isSelected={false}
      />
    );

    expect(screen.getByTestId('select-package-button')).toBeInTheDocument();
    expect(screen.getByText('text.select')).toBeInTheDocument();
    expect(screen.getByTestId('select-package-button')).toBeDisabled();
  });

  it.skip('should render the component for custom package, should show error snackbar when api fails', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.get(getEndpoint('/api/lead/v1alpha2/leads/fakeLeadId'), () =>
        HttpResponse.json({
          data: {
            checkout: {},
            insuranceKind: 'both',
          },
          status: 'LEAD_STATUS_NEW',
        })
      ),
      http.post(
        getEndpoint('v1alpha1/leads/fakeLeadId:selectPackageWithPricing'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json(), { status: 400 }))
      )
    );
    render(
      <SelectPackageButton
        packageData={customPackageData as unknown as TransformedPackageType}
        isSelected={false}
      />
    );

    expect(screen.getByTestId('select-package-button')).toBeInTheDocument();
    expect(screen.getByText('text.select')).toBeInTheDocument();
    await user.click(screen.getByTestId('select-package-button'));

    await waitFor(() => {
      expect(mockHandler).toHaveBeenNthCalledWith(1, {
        package: 'customPackages/f909b384-18b0-463c-990b-0b2ec6118f40',
        insuranceKind: 'BOTH',
        paymentOption: 'FULL_PAYMENT',
        paymentMethod: 'ONLINECARD',
        installmentPlan: 1,
        includeCustomQuote: true,
      });

      expect(mockSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errorMessage.generalErrorMessage',
        status: CONSTANTS.snackBarConfig.type.error,
      });
    });
  });
});
