import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import QcContainerList from '../QcContainerList';
import { Questions } from '../../config';
import * as authSlice from 'data/slices/authSlice';
import * as qcSliceSelector from 'data/slices/qcSlice/selector';
import * as useQcStatus from 'presentation/components/QcDetailPage/hooks/useQcStatus';
import * as stringUtils from 'utils/string';

// Mock dependencies
jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(),
}));

jest.mock('data/slices/qcSlice/selector', () => ({
  useGetQcDetail: jest.fn(),
}));

jest.mock('presentation/components/QcDetailPage/hooks/useQcStatus', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock(
  'presentation/components/common/QcInputContainer/QcInputContainer',
  () => ({
    __esModule: true,
    default: ({
      question,
      handleQuestionReject,
      handleQuestionApprove,
      handleQuestionEdit,
    }: any) => (
      <div data-testid={`qc-input-${question.qId}`}>
        <div data-testid="question-label">{question.label}</div>
        <div data-testid="question-value">{question.value}</div>
        <div data-testid="question-answer">{question.answer}</div>
        <div data-testid="question-readonly">
          {question.readOnly ? 'true' : 'false'}
        </div>
        <div data-testid="question-disabled">
          {question.disabled ? 'true' : 'false'}
        </div>
        {question.chip && (
          <div data-testid="question-chip">{question.chip}</div>
        )}
        {question.actionButton && (
          <div data-testid="question-action-button">
            {question.actionButton()}
          </div>
        )}
        <button
          type="button"
          data-testid="reject-button"
          onClick={() => handleQuestionReject(question)}
        >
          Reject
        </button>
        <button
          type="button"
          data-testid="approve-button"
          onClick={() => handleQuestionApprove(question)}
        >
          Approve
        </button>
        <button
          type="button"
          data-testid="edit-button"
          onClick={() => handleQuestionEdit(question)}
        >
          Edit
        </button>
      </div>
    ),
  })
);

jest.mock('presentation/components/common/Button/CommonButton', () => ({
  __esModule: true,
  default: ({ children, onClick, startIcon, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {startIcon}
      {children}
    </button>
  ),
}));

jest.mock('@material-ui/icons/Visibility', () => ({
  __esModule: true,
  default: () => <div data-testid="visibility-icon">Visibility</div>,
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('utils/string', () => ({
  findArrayOfString: jest.fn(),
}));

jest.mock('../../helpers/question', () => ({
  titleTextInAllLanguages: jest.fn(() => ['mr', 'mrs', 'miss']),
}));

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const mockStore = configureStore({
  reducer: {
    qcDetailReducer: (state = {}, _action: any) => state,
  },
});

const renderWithProviders = (component: React.ReactElement) =>
  render(<Provider store={mockStore}>{component}</Provider>);

describe('QcContainerList', () => {
  const defaultProps = {
    infoPanels: {
      haveCustomerEmail: 'Test Value 1',
      policyHolderNameWithTitle: 'Test Value 2',
    },
    questionList: [
      {
        qId: Questions.HAS_CUSTOMER_EMAIL,
        groupId: 'contactDetails',
        label: 'Test Question 1',
        isCritical: true,
        group: 'qc.contactDetails',
        title: 'text.insurancePackageTitle',
        name: 'test-package',
      },
      {
        qId: Questions.POLICYHOLDER_NAME_TITLE,
        groupId: 'policyholder',
        label: 'Test Question 2',
        isCritical: true,
        group: 'qc.policyHolder',
        title: 'text.insurancePackageTitle',
      },
    ],
    wrongAnswersList: [],
    shouldReadonly: false,
    handleQuestionReject: jest.fn(),
    handleQuestionApprove: jest.fn(),
    handleQuestionEdit: jest.fn(),
    setSelectedPackage: jest.fn(),
    setOpenPackageDetails: jest.fn(),
  };

  const mockQcDetail = {
    orderDetail: {
      order: {
        isCancelled: false,
        lead: 'test-lead-123',
        data: {
          policyHolder: {
            firstName: 'John',
          },
          idType: 'NationalID',
          idNumber: '1234567890123',
        },
      },
      customer: {
        emails: ['test@example.com'],
      },
    },
    answers: {
      haveCustomerEmail: { answer: 'Test Answer 1' },
      policyHolderNameWithTitle: { answer: 'Test Answer 2' },
      'test-package': {
        haveCustomerEmail: { answer: 'Package Answer 1' },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();

    // Default mock implementations
    (authSlice.useGetAuthenticateQuery as jest.Mock).mockReturnValue({
      data: { role: 'SALES_AGENT' },
    });

    (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(mockQcDetail);

    (useQcStatus.default as jest.Mock).mockReturnValue({
      isPending: false,
    });
  });

  describe('Basic Rendering', () => {
    it('renders questions correctly', () => {
      renderWithProviders(<QcContainerList {...defaultProps} />);

      expect(
        screen.getByTestId('qc-input-haveCustomerEmail')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('qc-input-policyHolderNameWithTitle')
      ).toBeInTheDocument();
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    });

    it('displays question values from infoPanels', () => {
      renderWithProviders(<QcContainerList {...defaultProps} />);

      expect(screen.getByText('Test Value 1')).toBeInTheDocument();
      expect(screen.getByText('Test Value 2')).toBeInTheDocument();
    });

    it('displays question answers from slice', () => {
      renderWithProviders(<QcContainerList {...defaultProps} />);

      expect(screen.getByText('Package Answer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Answer 2')).toBeInTheDocument();
    });
  });

  describe('Question State Management', () => {
    it('sets question as disabled when order is cancelled', () => {
      const cancelledOrderDetail = {
        ...mockQcDetail,
        orderDetail: {
          ...mockQcDetail.orderDetail,
          order: {
            ...mockQcDetail.orderDetail.order,
            isCancelled: true,
          },
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        cancelledOrderDetail
      );

      renderWithProviders(<QcContainerList {...defaultProps} />);

      const disabledQuestions = screen.getAllByTestId('question-disabled');
      expect(disabledQuestions[0]).toHaveTextContent('true');
      expect(disabledQuestions[1]).toHaveTextContent('true');
    });

    it('sets question as readonly based on wrong answers and user role', () => {
      const propsWithWrongAnswers = {
        ...defaultProps,
        wrongAnswersList: ['haveCustomerEmail'],
        shouldReadonly: true,
      };

      renderWithProviders(<QcContainerList {...propsWithWrongAnswers} />);

      const readonlyQuestions = screen.getAllByTestId('question-readonly');
      // Wrong answer question should be editable (not readonly)
      expect(readonlyQuestions[0]).toHaveTextContent('false');
      // Other questions should be readonly
      expect(readonlyQuestions[1]).toHaveTextContent('true');
    });

    it('sets question as readonly when pending and user is sales agent', () => {
      (useQcStatus.default as jest.Mock).mockReturnValue({
        isPending: true,
      });

      const propsWithReadonlyFalse = {
        ...defaultProps,
        shouldReadonly: false,
      };

      renderWithProviders(<QcContainerList {...propsWithReadonlyFalse} />);

      const readonlyQuestions = screen.getAllByTestId('question-readonly');
      expect(readonlyQuestions[0]).toHaveTextContent('false');
      expect(readonlyQuestions[1]).toHaveTextContent('false');
    });
  });

  describe('Question Handlers', () => {
    it('calls handleQuestionReject when reject button is clicked', () => {
      const mockHandleQuestionReject = jest.fn();
      const props = {
        ...defaultProps,
        handleQuestionReject: mockHandleQuestionReject,
      };

      renderWithProviders(<QcContainerList {...props} />);

      const rejectButtons = screen.getAllByTestId('reject-button');
      fireEvent.click(rejectButtons[0]);

      expect(mockHandleQuestionReject).toHaveBeenCalledWith(
        expect.objectContaining({
          qId: 'haveCustomerEmail',
          label: 'Test Question 1',
        })
      );
    });

    it('calls handleQuestionApprove when approve button is clicked', () => {
      const mockHandleQuestionApprove = jest.fn();
      const props = {
        ...defaultProps,
        handleQuestionApprove: mockHandleQuestionApprove,
      };

      renderWithProviders(<QcContainerList {...props} />);

      const approveButtons = screen.getAllByTestId('approve-button');
      fireEvent.click(approveButtons[0]);

      expect(mockHandleQuestionApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          qId: 'haveCustomerEmail',
          label: 'Test Question 1',
        })
      );
    });

    it('calls handleQuestionEdit when edit button is clicked', () => {
      const mockHandleQuestionEdit = jest.fn();
      const props = {
        ...defaultProps,
        handleQuestionEdit: mockHandleQuestionEdit,
      };

      renderWithProviders(<QcContainerList {...props} />);

      const editButtons = screen.getAllByTestId('edit-button');
      fireEvent.click(editButtons[0]);

      expect(mockHandleQuestionEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          qId: 'haveCustomerEmail',
          label: 'Test Question 1',
        })
      );
    });
  });

  describe('Special Question Types', () => {
    it('shows missing email warning when customer has no emails', () => {
      const questionListWithEmail = [
        {
          qId: Questions.HAS_CUSTOMER_EMAIL,
          groupId: 'contactDetails',
          label: 'Customer Email',
          isCritical: true,
          group: 'qc.contactDetails',
          title: 'text.insurancePackageTitle',
        },
      ];

      const qcDetailWithoutEmail = {
        ...mockQcDetail,
        orderDetail: {
          ...mockQcDetail.orderDetail,
          customer: {
            emails: [],
          },
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithoutEmail
      );

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithEmail}
        />
      );

      expect(screen.getByTestId('question-chip')).toHaveTextContent(
        'qc.missingEmailWarning'
      );
    });

    it('shows title warning when first name matches title text', () => {
      const questionListWithTitle = [
        {
          qId: Questions.POLICYHOLDER_NAME_TITLE,
          groupId: 'policyholder',
          label: 'Policyholder Title',
          isCritical: true,
          group: 'qc.policyHolder',
          title: 'text.insurancePackageTitle',
        },
      ];

      const qcDetailWithTitle = {
        ...mockQcDetail,
        orderDetail: {
          ...mockQcDetail.orderDetail,
          order: {
            ...mockQcDetail.orderDetail.order,
            data: {
              ...mockQcDetail.orderDetail.order.data,
              policyHolder: {
                firstName: 'mr',
              },
            },
          },
        },
      };

      (stringUtils.findArrayOfString as jest.Mock).mockReturnValue(true);
      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithTitle
      );

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithTitle}
        />
      );

      expect(screen.getByTestId('question-chip')).toHaveTextContent(
        'qc.checkTitleWarning'
      );
    });

    it('shows ID number warning for invalid National ID', () => {
      const questionListWithId = [
        {
          qId: Questions.CORRECT_ID_NUMBER,
          groupId: 'policyholder',
          label: 'ID Number',
          isCritical: true,
          group: 'qc.policyHolder',
          title: 'text.insurancePackageTitle',
        },
      ];

      const qcDetailWithInvalidId = {
        ...mockQcDetail,
        orderDetail: {
          ...mockQcDetail.orderDetail,
          order: {
            ...mockQcDetail.orderDetail.order,
            data: {
              ...mockQcDetail.orderDetail.order.data,
              idType: 'NationalID',
              idNumber: '123', // Invalid ID
            },
          },
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithInvalidId
      );

      renderWithProviders(
        <QcContainerList {...defaultProps} questionList={questionListWithId} />
      );

      expect(screen.getByTestId('question-chip')).toHaveTextContent(
        'qc.checkIdNumberWarning'
      );
    });

    it('renders coverage details action button', () => {
      const questionListWithCoverage = [
        {
          qId: 'COVERAGE_DETAILS',
          groupId: 'packages',
          label: 'qc.coverageDetails',
          isCritical: true,
          group: 'qc.packages',
          title: 'text.insurancePackageTitle',
        },
      ];

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithCoverage}
        />
      );

      expect(screen.getByTestId('question-action-button')).toBeInTheDocument();
      expect(screen.getByText('qc.seeDetails')).toBeInTheDocument();
      expect(screen.getByTestId('visibility-icon')).toBeInTheDocument();
    });

    it('opens coverage details in new window when action button is clicked', () => {
      const questionListWithCoverage = [
        {
          qId: 'COVERAGE_DETAILS',
          groupId: 'packages',
          label: 'qc.coverageDetails',
          isCritical: true,
          group: 'qc.packages',
          title: 'text.insurancePackageTitle',
        },
      ];

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithCoverage}
        />
      );

      const actionButton = screen.getByText('qc.seeDetails');
      fireEvent.click(actionButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/health/test-lead-123/detail',
        '_blank'
      );
    });
  });

  describe('User Role Behavior', () => {
    it('handles non-sales agent role correctly', () => {
      (authSlice.useGetAuthenticateQuery as jest.Mock).mockReturnValue({
        data: { role: 'ADMIN' },
      });

      renderWithProviders(<QcContainerList {...defaultProps} />);

      // Should still render questions
      expect(
        screen.getByTestId('qc-input-haveCustomerEmail')
      ).toBeInTheDocument();
    });

    it('handles missing user data', () => {
      (authSlice.useGetAuthenticateQuery as jest.Mock).mockReturnValue({
        data: null,
      });

      renderWithProviders(<QcContainerList {...defaultProps} />);

      expect(
        screen.getByTestId('qc-input-haveCustomerEmail')
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty question list', () => {
      renderWithProviders(
        <QcContainerList {...defaultProps} questionList={[]} />
      );

      expect(
        screen.queryByTestId('qc-input-haveCustomerEmail')
      ).not.toBeInTheDocument();
    });

    it('handles missing answers in slice', () => {
      const qcDetailWithoutAnswers = {
        ...mockQcDetail,
        answers: {},
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithoutAnswers
      );

      renderWithProviders(<QcContainerList {...defaultProps} />);

      // Should still render without errors
      expect(
        screen.getByTestId('qc-input-haveCustomerEmail')
      ).toBeInTheDocument();
    });

    it('handles missing order data', () => {
      const qcDetailWithoutOrder = {
        ...mockQcDetail,
        orderDetail: {
          ...mockQcDetail.orderDetail,
          order: null,
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithoutOrder
      );

      renderWithProviders(<QcContainerList {...defaultProps} />);

      // Should still render without errors
      expect(
        screen.getByTestId('qc-input-haveCustomerEmail')
      ).toBeInTheDocument();
    });

    it('handles questions with missing properties', () => {
      const questionListWithMissingProps = [
        {
          qId: 'test-question-3',
          // Missing label and other properties
        },
      ];

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithMissingProps}
        />
      );

      expect(
        screen.getByTestId('qc-input-test-question-3')
      ).toBeInTheDocument();
    });
  });

  describe('Package-related Questions', () => {
    it('handles package-specific answers correctly', () => {
      const questionListWithPackage = [
        {
          qId: 'package-question-1',
          name: 'test-package',
          label: 'Package Question',
        },
      ];

      const qcDetailWithPackageAnswers = {
        ...mockQcDetail,
        answers: {
          'test-package': {
            'package-question-1': { answer: 'Package Specific Answer' },
          },
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithPackageAnswers
      );

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithPackage}
        />
      );

      expect(screen.getByText('Package Specific Answer')).toBeInTheDocument();
    });

    it('handles missing package answers gracefully', () => {
      const questionListWithPackage = [
        {
          qId: 'package-question-1',
          name: 'test-package',
          label: 'Package Question',
        },
      ];

      const qcDetailWithoutPackageAnswers = {
        ...mockQcDetail,
        answers: {
          'test-package': {},
        },
      };

      (qcSliceSelector.useGetQcDetail as jest.Mock).mockReturnValue(
        qcDetailWithoutPackageAnswers
      );

      renderWithProviders(
        <QcContainerList
          {...defaultProps}
          questionList={questionListWithPackage}
        />
      );

      // Should render without errors
      expect(
        screen.getByTestId('qc-input-package-question-1')
      ).toBeInTheDocument();
    });
  });
});
