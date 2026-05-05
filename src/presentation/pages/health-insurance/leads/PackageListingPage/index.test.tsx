import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import PackageListingPage from './index';

const mockUseGetLeadByIDQuery = jest.fn();
const mockUseLazyGetPackagesQuery = jest.fn();
const mockUseGetProductSelector = jest.fn();
const mockPackageCard = jest.fn();

jest.mock('@alphafounders/ui', () => ({
  Button: ({ onClick, text }: { onClick: () => void; text: string }) => (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  ),
}));
jest.mock('@material-ui/core', () => ({
  Collapse: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock(
  'presentation/components/controls/Select',
  () =>
    function SelectMock() {
      return <div data-testid="select" />;
    }
);
jest.mock(
  './PackageFilter',
  () =>
    function PackageFilterMock() {
      return <div data-testid="package-filter" />;
    }
);
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation/transformations',
  () => ({
    transformHeaderType: jest.fn(() => 'primary'),
  })
);
jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    isPackageSelected: (pkg: any, selected: string) => pkg.id === selected,
  })
);
jest.mock(
  './PackageCard',
  () =>
    function PackageCardMock({ insurancePackage }: { insurancePackage: any }) {
      mockPackageCard(insurancePackage);
      return <div data-testid="package-card">{insurancePackage.name}</div>;
    }
);
jest.mock('data/slices/leadSlice', () => ({
  useGetLeadByIDQuery: (id: string) => mockUseGetLeadByIDQuery(id),
}));
jest.mock('data/slices/packageListing/api', () => ({
  useLazyGetPackagesQuery: () => mockUseLazyGetPackagesQuery(),
}));
jest.mock('presentation/redux/selectors/lead', () => ({
  useGetProductSelector: () => mockUseGetProductSelector(),
}));
jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));
jest.mock('@careos/utils', () => ({
  getAgeByBirthday: () => 30,
}));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'lead-id' }),
}));

describe('Health PackageListingPage ordering', () => {
  beforeEach(() => {
    mockUseGetProductSelector.mockReturnValue('health');
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        name: 'leads/lead-id',
        data: {
          checkout: {
            package: 'pkg-selected',
          },
        },
      },
      isLoading: false,
    });

    const packages = [
      {
        name: 'row-custom',
        customPackageResourceName: 'custom-1',
        package: {
          name: 'pkg-custom',
          premium: { units: '2000' },
          type: 'PLAN_TYPE_DEFAULT',
        },
      },
      {
        name: 'row-normal',
        package: {
          name: 'pkg-normal',
          premium: { units: '3000' },
          type: 'PLAN_TYPE_DEFAULT',
        },
      },
      {
        name: 'row-selected',
        package: {
          name: 'pkg-selected',
          premium: { units: '1000' },
          type: 'PLAN_TYPE_DEFAULT',
        },
      },
    ];

    mockUseLazyGetPackagesQuery.mockReturnValue([
      jest.fn(),
      {
        data: { packages },
        isLoading: false,
        isFetching: false,
        isError: false,
      },
    ]);
    mockPackageCard.mockClear();
  });

  it('orders selected, custom, then normal packages', async () => {
    render(<PackageListingPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('package-card');
      const names = cards.map((card) => card.textContent);
      expect(names).toEqual(['pkg-selected', 'pkg-custom', 'pkg-normal']);
    });
  });

  it('marks renewal packages with renewal_manual_quote', async () => {
    mockUseGetLeadByIDQuery.mockReturnValue({
      data: {
        name: 'leads/lead-id',
        data: {
          checkout: {
            package: '',
          },
        },
      },
      isLoading: false,
    });
    mockUseLazyGetPackagesQuery.mockReturnValue([
      jest.fn(),
      {
        data: {
          packages: [
            {
              name: 'row-renewal',
              package: {
                name: 'pkg-renewal',
                premium: { units: '1500' },
                type: 'PLAN_TYPE_RENEWAL',
              },
            },
          ],
        },
        isLoading: false,
        isFetching: false,
        isError: false,
      },
    ]);

    render(<PackageListingPage />);

    await waitFor(() => {
      expect(mockPackageCard).toHaveBeenCalled();
    });

    const [{ packageSource }] = mockPackageCard.mock.calls[0];
    expect(packageSource).toBe('renewal_manual_quote');
  });
});
