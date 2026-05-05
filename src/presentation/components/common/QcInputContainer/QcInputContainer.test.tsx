/* eslint-disable @typescript-eslint/no-non-null-assertion */
import VisibilityIcon from '@material-ui/icons/Visibility';
import userEvent from '@testing-library/user-event';
import React, { MouseEventHandler } from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';
import { QcContext } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/QcContext';

import QcInputContainer from './QcInputContainer';

import CommonButton from '../Button/CommonButton';

const customRender = (
  ui: React.ReactElement,
  { providerProps, ...renderOptions }: any = {}
) =>
  render(
    <QcContext.Provider {...providerProps}>{ui}</QcContext.Provider>,
    renderOptions
  );

const actionButton = (handleAction: MouseEventHandler<HTMLButtonElement>) => (
  <CommonButton
    color="default"
    variant="text"
    size="small"
    onClick={handleAction}
    startIcon={<VisibilityIcon fontSize="small" />}
  >
    See Details
  </CommonButton>
);

const questions = [
  {
    qId: 'RECORD_CONVERSATION_PERMISSION',
    label: 'Mandatory',
    value: 645.21,
    isEditable: false,
    isCritical: true,
  },
  {
    qId: 'HAS_CUSTOMER_EMAIL',
    label: 'Type 1',
    value: 11899.0,
    helperText:
      'This premium includes applicable no-claim discount, fix-driver discount, car DVR discount',
  },
  {
    qId: 'HAS_CUSTOMER_LINE',
    description:
      'Inform customer about change of premium if customers have claims after the renewal letter is issued',
    actionButton,
  },
  {
    qId: 'PREFERRED_DELIVERY_OPTION',
    label: 'Preferred delivery option',
    isEditable: true,
    value: 'Kerry Express',
  },
  {
    qId: 'LIABILITY',
    group: 'test',
    label: 'Third-party liability',
    coverageList: [
      ['Property damage', 2500000],
      ['Death per person', 2500000],
    ],
  },
];

const handleQuestionReject = jest.fn();
const handleQuestionApprove = jest.fn();

describe('Test <QcInputContainer/>', () => {
  beforeEach(() => {
    const QcContainers = (
      <div>
        {questions.map((question) => (
          <QcInputContainer
            key={question.qId}
            question={question}
            handleQuestionReject={handleQuestionReject}
            handleQuestionApprove={handleQuestionApprove}
          />
        ))}
      </div>
    );
    render(QcContainers);
  });
  it('<QcInputContainer/> render successfully', () => {
    expect(screen.getByText(questions[0].label!)).toBeInTheDocument();
  });

  it('<QcInputContainer/> render action button in the document', () => {
    expect(
      screen.getByRole('button', { name: 'See Details' })
    ).toBeInTheDocument();
  });
});

describe('Test <QcInputContainer/> handle update', () => {
  beforeEach(() => {
    const QcContainers = (
      <div>
        {questions.map((question) => (
          <QcInputContainer
            key={question.qId}
            question={question}
            handleQuestionReject={handleQuestionReject}
            handleQuestionApprove={handleQuestionApprove}
          />
        ))}
      </div>
    );
    render(QcContainers);
  });
  it('Mark as correct', async () => {
    const rejectBtn = screen.getAllByTestId('qc-reject-btn')[1];
    await userEvent.click(rejectBtn);
    expect(handleQuestionReject).toHaveBeenCalled();
  });

  it('Mark as incorrect', async () => {
    const approveBtn = screen.getAllByTestId('qc-approve-btn')[2];
    await userEvent.click(approveBtn);
    expect(handleQuestionApprove).toHaveBeenCalled();
  });
  it('Click on edit', async () => {
    const editBtn = screen.getByTestId('qc-edit-input');
    const btn = within(editBtn).getByRole('button');
    await userEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });
});

describe('Render QC nav tabs with context', () => {
  it('reject a question', async () => {
    const providerProps = {
      value: {
        state: {
          answers: {
            LIABILITY: false,
          },
          countdown: {
            test: 1,
          },
        },
        dispatch: () => null,
      },
    };
    customRender(
      <div>
        {questions.map((question) => (
          <QcInputContainer
            key={question.qId}
            question={question}
            handleQuestionReject={handleQuestionReject}
            handleQuestionApprove={handleQuestionApprove}
          />
        ))}
      </div>,
      { providerProps }
    );

    const rejectBtn = screen.getAllByTestId('qc-reject-btn')[1];
    await userEvent.click(rejectBtn);
    expect(screen.getByText('Third-party liability')).toBeInTheDocument();
  });
  it('approve a question', async () => {
    const providerProps = {
      value: {
        state: {
          answers: {
            LIABILITY: false,
          },
          countdown: {
            test: 1,
          },
        },
        dispatch: () => null,
      },
    };
    customRender(
      <div>
        {questions.map((question) => (
          <QcInputContainer
            key={question.qId}
            question={question}
            handleQuestionReject={handleQuestionReject}
            handleQuestionApprove={handleQuestionApprove}
          />
        ))}
      </div>,
      { providerProps }
    );

    const rejectBtn = screen.getAllByTestId('qc-approve-btn')[1];
    await userEvent.click(rejectBtn);
    expect(screen.getByText('Third-party liability')).toBeInTheDocument();
  });
});
