import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import PackageActionCell, {
  PackageActionCellColumn,
} from './PackageActionCell';

const mockGetApprovalStatus = jest.fn();
const mockGetString = jest.fn((key) => key);
const mockNavigate = jest.fn();
const mockGetPackageDetailUrl = jest.fn(() => '/leads/lead-1/detail');

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper',
  () => ({
    getApprovalStatus: (status?: string) => mockGetApprovalStatus(status),
  })
);

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => mockGetString(key),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('presentation/routes/Urls', () => ({
  getPackageDetailUrl: (params) => mockGetPackageDetailUrl(params),
}));

const defaultProps = {
  data: {
    id: 'pkg-1',
    name: 'customPackages/abc-123',
    packageSource: 'custom',
    insuranceKind: 'voluntary',
    customQuoteDetail: {
      approvalStatus: 'APPROVED',
      paymentOption: 'FULL_PAYMENT',
      paymentMethod: 'CASH',
      numberOfInstallments: 1,
    },
  },
  packageType: 'custom',
  selectedPackageName: '',
  leadId: 'lead-1',
  selectPackage: jest.fn(),
  handleCompareFunc: jest.fn(),
  handleOpenPackage: jest.fn(),
  openModal: jest.fn(),
  initialCar: {
    carSubModelYear: 1,
    brand: '3',
    year: '2011',
    model: '45',
    engineSize: 2000,
    noOfDoors: 4,
  },
  filterValues: {
    brand: '3',
    year: '2011',
    model: '45',
    engineSize: 2000,
    noOfDoors: 4,
  },
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('PackageActionCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApprovalStatus.mockReturnValue({
      text: mockGetString('text.noApprovalRequired'),
      variant: 'success',
    });
  });

  describe('always visible buttons', () => {
    it('renders Compare, Payment, and Quotation buttons', () => {
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /newPackageListing\.compare/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /newPackageListing\.payment/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /newPackageListing\.quotation/i })
      ).toBeInTheDocument();
    });

    it('calls handleCompareFunc with data.id when Compare is clicked', () => {
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      fireEvent.click(
        screen.getByRole('button', { name: /newPackageListing\.compare/i })
      );
      expect(defaultProps.handleCompareFunc).toHaveBeenCalledWith('pkg-1');
    });

    it('calls navigate with getPackageDetailUrl when Quotation is clicked', () => {
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      fireEvent.click(
        screen.getByRole('button', { name: /newPackageListing\.quotation/i })
      );
      expect(mockGetPackageDetailUrl).toHaveBeenCalledWith({
        leadId: 'lead-1',
        packageId: 'pkg-1',
        noParams: true,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/leads/lead-1/detail');
    });
  });

  describe('Payment button', () => {
    it('calls openModal when car filter differs from initialCar (shouldOpenModal)', () => {
      renderWithRouter(
        <PackageActionCell
          {...defaultProps}
          initialCar={{}}
          filterValues={defaultProps.filterValues}
        />
      );
      fireEvent.click(
        screen.getByRole('button', { name: /newPackageListing\.payment/i })
      );
      expect(defaultProps.openModal).toHaveBeenCalledWith('pkg-1');
      expect(defaultProps.handleOpenPackage).not.toHaveBeenCalled();
    });

    it('calls handleOpenPackage when car filter matches initialCar', () => {
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      fireEvent.click(
        screen.getByRole('button', { name: /newPackageListing\.payment/i })
      );
      expect(defaultProps.handleOpenPackage).toHaveBeenCalledWith(
        defaultProps.data
      );
      expect(defaultProps.openModal).not.toHaveBeenCalled();
    });
  });

  describe('custom package status content (packageType === "custom")', () => {
    it('shows selected label when selectedPackageName === data.name', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.approved'),
        variant: 'success',
      });
      renderWithRouter(
        <PackageActionCell
          {...defaultProps}
          selectedPackageName="customPackages/abc-123"
        />
      );
      expect(
        screen.getByText('packageListing.selected')
      ).toBeInTheDocument();
    });

    it('shows rejected status text when approval status is REJECTED', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.rejected'),
        variant: 'muted',
      });
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      expect(screen.getByText('text.rejected')).toBeInTheDocument();
    });

    it('shows waiting approval status text when approval status is PENDING', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.waitingApproval'),
        variant: 'warning',
      });
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      expect(screen.getByText('text.waitingApproval')).toBeInTheDocument();
    });

    it('shows Select button when custom source and not selected and not rejected/pending', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.noApprovalRequired'),
        variant: 'success',
      });
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      const selectButton = screen.getByRole('button', {
        name: /newPackageListing\.select/i,
      });
      expect(selectButton).toBeInTheDocument();
      fireEvent.click(selectButton);
      expect(defaultProps.selectPackage).toHaveBeenCalledWith({
        leadId: 'lead-1',
        payload: {
          paymentOption: 'FULL_PAYMENT',
          paymentMethod: 'CASH',
          installmentPlan: 1,
          insuranceKind: 'VOLUNTARY',
          package: 'pkg-1',
        },
      });
    });

    it('does not show custom status when packageSource is manual', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.rejected'),
        variant: 'muted',
      });
      renderWithRouter(
        <PackageActionCell
          {...defaultProps}
          data={{ ...defaultProps.data, packageSource: 'manual' } as any}
        />
      );
      expect(screen.queryByText('text.rejected')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /newPackageListing\.select/i })
      ).not.toBeInTheDocument();
    });

    it('does not show custom status when packageSource is renewal_manual_quote', () => {
      renderWithRouter(
        <PackageActionCell
          {...defaultProps}
          data={{
            ...defaultProps.data,
            packageSource: 'renewal_manual_quote',
          } as any}
        />
      );
      expect(
        screen.queryByRole('button', { name: /newPackageListing\.select/i })
      ).not.toBeInTheDocument();
    });

    it('does not show custom status when packageType is not custom', () => {
      renderWithRouter(
        <PackageActionCell {...defaultProps} packageType="normal" />
      );
      expect(
        screen.queryByRole('button', { name: /newPackageListing\.select/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('packageListing.selected')).not.toBeInTheDocument();
    });

    it('calls selectPackage with payload when Select is clicked and selectPackage is provided', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.noApprovalRequired'),
        variant: 'success',
      });
      const selectPackage = jest.fn();
      renderWithRouter(
        <PackageActionCell {...defaultProps} selectPackage={selectPackage} />
      );
      fireEvent.click(
        screen.getByRole('button', { name: /newPackageListing\.select/i })
      );
      expect(selectPackage).toHaveBeenCalled();
    });

    it('does not throw when Select is clicked and selectPackage is undefined', () => {
      mockGetApprovalStatus.mockReturnValue({
        text: mockGetString('text.noApprovalRequired'),
        variant: 'success',
      });
      renderWithRouter(
        <PackageActionCell {...defaultProps} selectPackage={undefined} />
      );
      expect(() =>
        fireEvent.click(
          screen.getByRole('button', { name: /newPackageListing\.select/i })
        )
      ).not.toThrow();
    });
  });

  describe('Compare button preventDefault', () => {
    it('calls preventDefault on event when Compare is clicked', () => {
      renderWithRouter(<PackageActionCell {...defaultProps} />);
      const compareButton = screen.getByRole('button', {
        name: /newPackageListing\.compare/i,
      });
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      fireEvent(compareButton, event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
});

describe('PackageActionCellColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApprovalStatus.mockReturnValue({
      text: mockGetString('text.noApprovalRequired'),
      variant: 'success',
    });
  });

  it('renders PackageActionCell with passed props', () => {
    renderWithRouter(<PackageActionCellColumn {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /newPackageListing\.compare/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /newPackageListing\.payment/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /newPackageListing\.quotation/i })
    ).toBeInTheDocument();
  });

  it('forwards all props to PackageActionCell', () => {
    renderWithRouter(
      <PackageActionCellColumn
        {...defaultProps}
        selectedPackageName="customPackages/abc-123"
      />
    );
    expect(
      screen.getByText('packageListing.selected')
    ).toBeInTheDocument();
  });
});
