import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RenderCustomValue } from './RenderCustomValue';

jest.mock('data/slices/importSlices/helper', () => ({
  customImportedStatus: jest.fn((status) => {
    const statusMap = {
      IN_PROGRESS: 'importFileStatus.inProgress',
      COMPLETE: 'importFileStatus.complete',
      ERROR: 'importFileStatus.error',
      PENDING: '',
    };
    return statusMap[status] || '';
  }),
}));
jest.mock('utils/endpointHelper', () => ({
  __esModule: true,
  default: jest.fn((leadName) => `https://api.example.com/leads/${leadName}`),
}));
jest.mock('presentation/theme/localization', () => ({
  getLanguage: jest.fn(() => 'en'),
}));
jest.mock('lodash', () => ({
  uniqueId: jest.fn(() => 'test-unique-id'),
}));
jest.mock('clsx', () => ({
  __esModule: true,
  default: (...args: any[]) => args.filter(Boolean).join(' '),
}));
jest.mock('presentation/components/OrderListingTable/TextStatus', () => ({
  __esModule: true,
  default: ({
    label,
    status,
    type,
    handleClick,
    tableType,
    isDownloadable,
  }: any) => (
    <button type="button" data-testid="text-status" onClick={handleClick}>
      {label} - {status} - {type} - {tableType} -{' '}
      {isDownloadable ? 'downloadable' : 'not-downloadable'}
    </button>
  ),
}));
jest.mock('@alphafounders/ui', () => ({
  Button: ({ onClick, text, className, id }: any) => (
    <button
      type="button"
      data-testid="custom-button"
      onClick={onClick}
      className={className}
      id={id}
    >
      {text}
    </button>
  ),
}));
jest.mock('presentation/components/icons', () => ({
  ViewPurchaseIcon: () => (
    <div data-testid="view-purchase-icon">ViewPurchaseIcon</div>
  ),
}));
jest.mock('@alphafounders/icons', () => ({
  RedirectIcon: ({ className, fillColor }: any) => (
    <div
      data-testid="redirect-icon"
      className={className}
      style={{ fill: fillColor }}
    >
      RedirectIcon
    </div>
  ),
}));
jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  TableCell: ({ children, title, className }: any) => (
    <td data-testid="table-cell" title={title} className={className}>
      {children}
    </td>
  ),
}));
describe('RenderCustomValue', () => {
  const defaultProps = {
    value: 'test-value',
    row: { leadName: 'test-lead' },
    id: 'default',
    isDownloadable: false,
    handleFailedPackageClick: jest.fn(),
    isSelectable: false,
    isRedirectable: false,
    column: {},
    tableType: 'default',
    classes: {
      statusGreen: 'status-green',
      statusOrange: 'status-orange',
      statusGray: 'status-gray',
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('status rendering', () => {
    it('renders status with circle icon when isSelectable and not isRedirectable', () => {
      const props = {
        ...defaultProps,
        id: 'status',
        value: 'IN_PROGRESS',
        isSelectable: true,
        isRedirectable: false,
        column: { circleIcon: true },
      };
      render(<RenderCustomValue {...props} />);
      const statusElement = screen.getByTestId('text-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.textContent).toContain('circle');
    });
    it('renders status with text type when isSelectable and isRedirectable', () => {
      const props = {
        ...defaultProps,
        id: 'status',
        value: 'COMPLETE',
        isSelectable: true,
        isRedirectable: true,
        column: { circleIcon: true },
      };
      render(<RenderCustomValue {...props} />);
      const statusElement = screen.getByTestId('text-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.textContent).toContain('text');
    });
    it('renders status with text type when circleIcon is false', () => {
      const props = {
        ...defaultProps,
        id: 'status',
        value: 'ERROR',
        isSelectable: true,
        isRedirectable: false,
        column: { circleIcon: false },
      };
      render(<RenderCustomValue {...props} />);
      const statusElement = screen.getByTestId('text-status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.textContent).toContain('text');
    });
    it('handles status click correctly', () => {
      const mockHandleClick = jest.fn();
      const props = {
        ...defaultProps,
        id: 'status',
        value: 'PENDING',
        handleFailedPackageClick: mockHandleClick,
      };
      render(<RenderCustomValue {...props} />);
      const statusElement = screen.getByTestId('text-status');
      fireEvent.click(statusElement);
      expect(mockHandleClick).toHaveBeenCalledWith(props.row);
    });
  });
  describe('file rendering', () => {
    it('renders file button with onClick handler', () => {
      const mockOnClick = jest.fn();
      const props = {
        ...defaultProps,
        id: 'file',
        column: { onClick: mockOnClick },
      };
      render(<RenderCustomValue {...props} />);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('id', 'data-file-icon');
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalled();
    });
    it('renders file button without onClick handler', () => {
      const props = {
        ...defaultProps,
        id: 'file',
        column: {},
      };
      render(<RenderCustomValue {...props} />);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
      fireEvent.click(button); // Should not throw error
    });
  });
  describe('leadId rendering', () => {
    it('renders redirect link when isRedirectable is true', () => {
      const props = {
        ...defaultProps,
        id: 'leadId',
        value: 'LEAD-123',
        isRedirectable: true,
        row: { leadName: 'test-lead-123' },
      };
      render(<RenderCustomValue {...props} />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        'href',
        'https://api.example.com/leads/test-lead-123'
      );
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
      expect(link.textContent).toContain('LEAD-123');
    });
    it('renders default value when isRedirectable is false', () => {
      const props = {
        ...defaultProps,
        id: 'leadId',
        value: { shortnameEn: 'English Name', shortnameTh: 'Thai Name' },
        isRedirectable: false,
      };
      render(<RenderCustomValue {...props} />);
      expect(screen.getByText('English Name')).toBeInTheDocument();
    });
    it('renders default value when value is not an object', () => {
      const props = {
        ...defaultProps,
        id: 'leadId',
        value: 'Simple String Value',
        isRedirectable: false,
      };
      render(<RenderCustomValue {...props} />);
      expect(screen.getByText('Simple String Value')).toBeInTheDocument();
    });
  });
  describe('leadStatus rendering', () => {
    it('renders lead status table cell when tableType is all-leads', () => {
      const props = {
        ...defaultProps,
        id: 'leadStatus',
        value: 'Active',
        tableType: 'all-leads',
        row: { isRejected: false, rejections: [{ decideTime: '2023-01-01' }] },
      };
      render(<RenderCustomValue {...props} />);
      const tableCell = screen.getByTestId('table-cell');
      expect(tableCell).toBeInTheDocument();
      expect(tableCell).toHaveClass('status-green');
      expect(tableCell.textContent).toBe('Active');
    });
    it('renders lead status with gray class when isRejected is true', () => {
      const props = {
        ...defaultProps,
        id: 'leadStatus',
        value: 'Rejected',
        tableType: 'all-leads',
        row: { isRejected: true, rejections: [] },
      };
      render(<RenderCustomValue {...props} />);
      const tableCell = screen.getByTestId('table-cell');
      expect(tableCell).toHaveClass('status-gray');
    });
    it('renders default value when tableType is not all-leads', () => {
      const props = {
        ...defaultProps,
        id: 'leadStatus',
        value: { shortnameEn: 'Status EN', shortnameTh: 'Status TH' },
        tableType: 'other-type',
      };
      render(<RenderCustomValue {...props} />);
      expect(screen.getByText('Status EN')).toBeInTheDocument();
    });
  });
  describe('default rendering', () => {
    it('renders default value for unknown id', () => {
      const props = {
        ...defaultProps,
        id: 'unknown',
        value: { shortnameEn: 'Default EN', shortnameTh: 'Default TH' },
      };
      render(<RenderCustomValue {...props} />);
      expect(screen.getByText('Default EN')).toBeInTheDocument();
    });
    it('renders value directly when it is not an object', () => {
      const props = {
        ...defaultProps,
        id: 'unknown',
        value: 'Direct String Value',
      };
      render(<RenderCustomValue {...props} />);
      expect(screen.getByText('Direct String Value')).toBeInTheDocument();
    });
  });
});
