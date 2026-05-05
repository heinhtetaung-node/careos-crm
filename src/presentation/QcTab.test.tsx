import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '__mocks__/server';
import { ItemQcStatus, ItemApprovalStatus } from 'shared/constants/orderType';
import QcTab from './QcTab';

// Import mocked modules
import * as submissionSlice from 'data/slices/submissionSlice';
import * as orderPolicySlice from 'data/slices/orderPolicySlice';
import * as policyDocsSlice from 'data/slices/policyDocsSlice';
import useOrderComments from './hooks/useOrderComments';
import useSnackbar from 'utils/snackbar';
import * as reactRouterDom from 'react-router-dom';

// Mock all the hooks and dependencies
jest.mock('data/slices/submissionSlice', () => ({
  useUpdateSubmissionMutation: jest.fn(),
}));

jest.mock('data/slices/orderPolicySlice', () => ({
  useUpdatePolicyApprovalStatusMutation: jest.fn(),
}));

jest.mock('data/slices/policyDocsSlice', () => ({
  useLazyGetPolicyDocsQuery: jest.fn(),
}));

jest.mock('./hooks/useOrderComments', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('utils/snackbar', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

function MockDialog({
  open,
  children,
  handleToggle,
  content,
  footerContent,
}: any) {
  if (!open) return null;
  return (
    <div data-testid="dialog">
      <div data-testid="dialog-content">{content ?? children}</div>
      {footerContent && <div data-testid="dialog-footer">{footerContent}</div>}
      <button onClick={handleToggle} data-testid="dialog-close" type="button">
        Close
      </button>
    </div>
  );
}

jest.mock('./components/common/Dialog', () => ({
  __esModule: true,
  default: MockDialog,
}));

function MockSubmissionStatusForm({ onSubmit, handleRejectReason }: any) {
  return (
    <div data-testid="submission-status-form">
      <button
        type="button"
        onClick={() =>
          onSubmit({
            status: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
            comment: 'test',
          })
        }
      >
        Submit
      </button>
      <button onClick={handleRejectReason} type="button">
        Reject Reason
      </button>
    </div>
  );
}

jest.mock(
  './pages/car-insurance/OrderDetailPage/SubmissionOrderDetailPage/SubmissionStatusButtons/SubmissionStatusForm',
  () => ({
    __esModule: true,
    default: MockSubmissionStatusForm,
  })
);

function MockCommonTextField({ label, ...props }: any) {
  return (
    <div>
      <label htmlFor={props.dataTestId}>{label}</label>
    </div>
  );
}

jest.mock('./components/common/CommonTextField/CommonTextField', () => ({
  __esModule: true,
  default: MockCommonTextField,
}));

function MockAutocomplete({ options, onChange, textFieldProps }: any) {
  return (
    <div>
      <label htmlFor="autocomplete-select">{textFieldProps?.label}</label>
      <select
        id="autocomplete-select"
        onChange={(e) => {
          const option = options.find(
            (opt: any) => opt.value === e.target.value
          );
          onChange(e, option);
        }}
      >
        {options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function MockCommonButton({ children, onClick, ...props }: any) {
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}

jest.mock('presentation/components/common/Autocomplete', () => ({
  __esModule: true,
  default: MockAutocomplete,
}));

jest.mock('presentation/components/common/Button/CommonButton', () => ({
  __esModule: true,
  default: MockCommonButton,
}));

jest.mock('./components/ActivityOrderSection/helper', () => ({
  __esModule: true,
  default: {
    getPolicyIdFromName: jest.fn().mockReturnValue('test-policy-id'),
  },
}));

jest.mock(
  './pages/car-insurance/OrderDetailPage/ApprovalOrderDetailPage/ApprovalStatusButtons',
  () => ({
    ConfirmAction: {
      insurerApproved: 'insurerApproved',
      policyUploaded: 'policyUploaded',
      issuesFixed: 'issuesFixed',
    },
    statusOptions: [
      { title: 'Remarks', value: 'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM' },
      { title: 'Rejected', value: 'ITEM_APPROVAL_STATUS_REJECTED' },
    ],
  })
);

jest.mock('./theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

// Type assertions for mocked modules
const mockUseUpdateSubmissionMutation =
  submissionSlice.useUpdateSubmissionMutation;
const mockUseUpdatePolicyApprovalStatusMutation =
  orderPolicySlice.useUpdatePolicyApprovalStatusMutation;
const mockUseLazyGetPolicyDocsQuery = policyDocsSlice.useLazyGetPolicyDocsQuery;
const mockUseOrderComments = useOrderComments;
const mockUseSnackbar = useSnackbar;
const mockUseLocation = reactRouterDom.useLocation;
const mockUseNavigate = reactRouterDom.useNavigate;

describe('QcTab', () => {
  const defaultProps = {
    policy: {
      name: 'orders/test-order/items/test-policy',
      qcStatus: ItemQcStatus.PENDING,
      submissionStatus: 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
      approvalStatus: ItemApprovalStatus.PENDING,
      documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
      policyNumber: 'POL123',
    },
    uploadedDocuments: [
      { type: 'DOCUMENT_TYPE_ID_CARD', name: 'id-card.pdf' },
      { type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' },
    ],
    isSaleAgent: false,
    refetchPolicyItems: jest.fn(),
  };

  const mockUpdateSubmission = jest.fn();
  const mockUpdateApprovalStatus = jest.fn();
  const mockGetPolicyDocs = jest.fn();
  const mockAddAndGetComment = jest.fn();
  const mockShowErrorSnackbar = jest.fn();
  const mockShowSuccessSnackbar = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseUpdateSubmissionMutation.mockReturnValue([
      mockUpdateSubmission,
      { isSuccess: false, isError: false },
    ]);

    mockUseUpdatePolicyApprovalStatusMutation.mockReturnValue([
      mockUpdateApprovalStatus,
      { isSuccess: false, isError: false },
    ]);

    mockUseLazyGetPolicyDocsQuery.mockReturnValue([mockGetPolicyDocs]);

    mockUseOrderComments.mockReturnValue([mockAddAndGetComment]);

    mockUseSnackbar.mockReturnValue({
      showErrorSnackbar: mockShowErrorSnackbar,
      showSuccessSnackbar: mockShowSuccessSnackbar,
    });

    mockUseLocation.mockReturnValue({ pathname: '/orders/test-order' });
    mockUseNavigate.mockReturnValue(mockNavigate);

    // Setup default API responses
    server.use(
      http.get('*/api/order/v1alpha1/orders/*/documents', () =>
        HttpResponse.json({
          data: {
            documents: [{ type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' }],
          },
        })
      )
    );
  });

  describe('Component Rendering', () => {
    it('renders QC status tabs correctly', () => {
      render(<QcTab {...defaultProps} />);

      expect(screen.getByText('healthOrder.pendingQc')).toBeInTheDocument();
      expect(
        screen.getByText('healthOrder.pendingSubmission')
      ).toBeInTheDocument();
      expect(
        screen.getByText('healthOrder.pendingApprove')
      ).toBeInTheDocument();
    });

    it('renders with QC approved status', () => {
      const propsWithQcApproved = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
        },
      };

      render(<QcTab {...propsWithQcApproved} />);

      expect(screen.getByText('healthOrder.passedQc')).toBeInTheDocument();
    });

    it('renders with submission submitted status', () => {
      const propsWithSubmissionSubmitted = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        },
      };

      render(<QcTab {...propsWithSubmissionSubmitted} />);

      expect(
        screen.getByText('healthOrder.passedSubmission')
      ).toBeInTheDocument();
    });
  });

  describe('getActiveQCStatus function', () => {
    it('returns 0 for pending QC status', () => {
      const propsWithPendingQc = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.PENDING,
        },
      };

      render(<QcTab {...propsWithPendingQc} />);

      // The first tab should be active
      const tabs = screen.getAllByRole('button');
      expect(tabs[0]).toHaveClass('bg-primary');
    });

    it('returns 1 for approved QC status with non-submitted submission', () => {
      const propsWithApprovedQc = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
        },
      };

      render(<QcTab {...propsWithApprovedQc} />);

      // The second tab should be active
      const tabs = screen.getAllByRole('button');
      expect(tabs[1]).toHaveClass('bg-primary');
    });

    it('returns 2 for approved QC status with submitted submission', () => {
      const propsWithApprovedQcAndSubmitted = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        },
      };

      render(<QcTab {...propsWithApprovedQcAndSubmitted} />);

      // The third tab should be active
      const tabs = screen.getAllByRole('button');
      expect(tabs[2]).toHaveClass('bg-primary');
    });

    it('returns 0 for unknown QC status', () => {
      const propsWithUnknownQc = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: 'UNKNOWN_STATUS',
        },
      };

      render(<QcTab {...propsWithUnknownQc} />);

      // The first tab should be active
      const tabs = screen.getAllByRole('button');
      expect(tabs[0]).toHaveClass('bg-primary');
    });
  });

  describe('Tab Click Handlers', () => {
    it('navigates to QC page when clicking first tab', async () => {
      const propsWithActiveFirstTab = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.PENDING,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithActiveFirstTab} />);

      const firstTab = screen.getAllByRole('button')[0];
      await userEvent.click(firstTab);

      expect(mockNavigate).toHaveBeenCalledWith('/orders/qc/test-order');
    });

    it('opens comment dialog when clicking second tab', async () => {
      const propsWithActiveSecondTab = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      mockGetPolicyDocs.mockResolvedValue({
        data: {
          documents: [{ type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' }],
        },
      });

      render(<QcTab {...propsWithActiveSecondTab} />);

      const secondTab = screen.getAllByRole('button')[1];
      await userEvent.click(secondTab);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('opens comment dialog when clicking third tab', async () => {
      const propsWithActiveThirdTab = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      mockGetPolicyDocs.mockResolvedValue({
        data: {
          documents: [{ type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' }],
        },
      });

      render(<QcTab {...propsWithActiveThirdTab} />);

      const thirdTab = screen.getAllByRole('button')[2];
      await userEvent.click(thirdTab);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('opens confirm dialog when validation passes for step 3', async () => {
      const propsWithActiveThirdTab = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
          policyNumber: 'POL123',
        },
      };

      mockGetPolicyDocs.mockResolvedValue({
        data: {
          documents: [{ type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' }],
        },
      });

      render(<QcTab {...propsWithActiveThirdTab} />);

      const thirdTab = screen.getAllByRole('button')[2];
      await userEvent.click(thirdTab);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Success and Error Handling', () => {
    it('shows success message and refetches on submission success', () => {
      mockUseUpdateSubmissionMutation.mockReturnValue([
        mockUpdateSubmission,
        { isSuccess: true, isError: false },
      ]);

      render(<QcTab {...defaultProps} />);

      expect(mockShowSuccessSnackbar).toHaveBeenCalledWith(
        'tableListing.orderUpdated'
      );
      expect(defaultProps.refetchPolicyItems).toHaveBeenCalled();
    });

    it('shows success message and refetches on approval success', () => {
      mockUseUpdatePolicyApprovalStatusMutation.mockReturnValue([
        mockUpdateApprovalStatus,
        { isSuccess: true, isError: false },
      ]);

      render(<QcTab {...defaultProps} />);

      expect(mockShowSuccessSnackbar).toHaveBeenCalledWith(
        'tableListing.orderUpdated'
      );
      expect(defaultProps.refetchPolicyItems).toHaveBeenCalled();
    });

    it('shows error message on submission error', () => {
      mockUseUpdateSubmissionMutation.mockReturnValue([
        mockUpdateSubmission,
        { isSuccess: false, isError: true },
      ]);

      render(<QcTab {...defaultProps} />);

      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'errorMessage.generalErrorMessage'
      );
    });

    it('shows error message on approval error', () => {
      mockUseUpdatePolicyApprovalStatusMutation.mockReturnValue([
        mockUpdateApprovalStatus,
        { isSuccess: false, isError: true },
      ]);

      render(<QcTab {...defaultProps} />);

      expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
        'errorMessage.generalErrorMessage'
      );
    });
  });

  describe('Policy Upload Button', () => {
    it('shows policy upload button when approved', () => {
      const propsWithApproved = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.APPROVED,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithApproved} />);

      expect(
        screen.getByText('approveStatus.policyUpload')
      ).toBeInTheDocument();
    });

    it('handles policy upload button click', async () => {
      const propsWithApproved = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.APPROVED,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      mockGetPolicyDocs.mockResolvedValue({
        data: {
          documents: [{ type: 'DOCUMENT_TYPE_POLICY', name: 'policy.pdf' }],
        },
      });

      render(<QcTab {...propsWithApproved} />);

      const policyUploadButton = screen.getByText('approveStatus.policyUpload');
      await userEvent.click(policyUploadButton);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('shows rejected status text', () => {
      const propsWithRejected = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.REJECTED,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithRejected} />);

      expect(
        screen.getByText('approvalStatusOptions.rejected')
      ).toBeInTheDocument();
    });

    it('shows submission problem status text', () => {
      const propsWithSubmissionProblem = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.SUBMISSION_PROBLEM,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithSubmissionProblem} />);

      expect(
        screen.getByText('approvalStatusOptions.submissionProblem')
      ).toBeInTheDocument();
    });

    it('shows policy uploaded status text', () => {
      const propsWithPolicyUploaded = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.POLICY_UPLOADED,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithPolicyUploaded} />);

      expect(
        screen.getByText('approveStatus.policyUploaded')
      ).toBeInTheDocument();
    });
  });

  describe('Sales Agent Restrictions', () => {
    it('disables tab clicks for sales agent', async () => {
      const propsWithSalesAgent = {
        ...defaultProps,
        isSaleAgent: true,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          approvalStatus: ItemApprovalStatus.APPROVED,
          documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
        },
      };

      render(<QcTab {...propsWithSalesAgent} />);

      const policyUploadButton = screen.getByText('approveStatus.policyUpload');
      await userEvent.click(policyUploadButton);

      // Should not navigate or open dialogs
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Document Status Validation', () => {
    it('disables tabs when document status is not complete', () => {
      const propsWithIncompleteDocuments = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          qcStatus: ItemQcStatus.APPROVED,
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
          documentStatus: 'ITEM_DOCUMENT_STATUS_PENDING',
        },
      };

      render(<QcTab {...propsWithIncompleteDocuments} />);

      const tabs = screen.getAllByRole('button');
      tabs.forEach((tab) => {
        expect(tab).not.toHaveClass('bg-primary');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing policy name', () => {
      const propsWithMissingName = {
        ...defaultProps,
        policy: {
          ...defaultProps.policy,
          name: undefined,
        },
      };

      render(<QcTab {...propsWithMissingName} />);

      // Should not crash and should render tabs
      expect(screen.getByText('healthOrder.pendingQc')).toBeInTheDocument();
    });

    it('handles missing uploaded documents', () => {
      const propsWithNoDocuments = {
        ...defaultProps,
        uploadedDocuments: [],
      };

      render(<QcTab {...propsWithNoDocuments} />);

      // Should not crash and should render tabs
      expect(screen.getByText('healthOrder.pendingQc')).toBeInTheDocument();
    });
  });
});
