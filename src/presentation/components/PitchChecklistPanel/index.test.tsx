import userEvent from '@testing-library/user-event';
import React from 'react';

import i18n from '__tests__/i18n-context';
import { render, screen } from '__tests__/rtl-test-utils';
import { LANGUAGES } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import PitchChecklistPanel from '.';

const mockUseGetPitchChecklistQuery = jest.fn();
const mockUseUpdatePitchChecklistItemMutation = jest.fn();

jest.mock('data/slices/leadDetails/pitchChecklistSlice', () => ({
  useGetPitchChecklistQuery: (...args: unknown[]) =>
    mockUseGetPitchChecklistQuery(...args),
  useUpdatePitchChecklistItemMutation: () =>
    mockUseUpdatePitchChecklistItemMutation(),
}));

jest.mock('utils/snackbar', () => {
  const showErrorSnackbar = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({ showErrorSnackbar })),
  };
});

const showErrorSnackbarMock = (useSnackbar as jest.Mock)().showErrorSnackbar;

const mockedPitchChecklist = {
  name: 'leads/fakeLeadId/pitchChecklist',
  version: 'motor-v1',
  sections: [
    {
      key: 'greeting',
      labelTh: 'ทักทาย',
      labelEn: 'Greeting',
      order: 2,
      items: [
        {
          key: 'confirm_customer_name',
          checked: true,
          labelTh: 'ชื่อลูกค้า',
          labelEn: 'Confirm customer name',
        },
      ],
    },
    {
      key: 'close_conversation',
      labelTh: 'ปิดบทสนทนา',
      labelEn: 'Close Conversation',
      order: 10,
      items: [
        {
          key: 'thank_customer',
          checked: false,
          labelTh: 'ขอบคุณลูกค้า',
          labelEn: 'Thank customer',
        },
      ],
    },
  ],
  stats: {
    checked: 1,
    total: 2,
  },
};

describe('PitchChecklistPanel', () => {
  beforeEach(async () => {
    await i18n.changeLanguage(LANGUAGES.ENGLISH);
    mockUseGetPitchChecklistQuery.mockReturnValue({
      data: mockedPitchChecklist,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseUpdatePitchChecklistItemMutation.mockReturnValue([
      jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      }),
    ]);
    showErrorSnackbarMock.mockReset();
  });

  test('shows compact header and expands on toggle', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(
      <PitchChecklistPanel
        leadName="leads/fakeLeadId"
        isEditable
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByTestId('pitch-checklist-panel')).toBeInTheDocument();
    expect(screen.getByText('(50%)')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  test('updates item when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const updatePitchChecklistItem = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    mockUseUpdatePitchChecklistItemMutation.mockReturnValue([
      updatePitchChecklistItem,
    ]);

    render(
      <PitchChecklistPanel
        leadName="leads/fakeLeadId"
        isEditable
        isExpanded
        onToggle={jest.fn()}
      />
    );

    await user.click(screen.getByLabelText('Thank customer'));

    expect(updatePitchChecklistItem).toHaveBeenCalledWith({
      leadName: 'leads/fakeLeadId',
      itemKey: 'thank_customer',
      checked: true,
    });
  });

  test('disables checkbox when panel is read only', () => {
    render(
      <PitchChecklistPanel
        leadName="leads/fakeLeadId"
        isEditable={false}
        isExpanded
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Thank customer')).toBeDisabled();
  });

  test('uses Thai labels and falls back to English when Thai labels are missing', async () => {
    await i18n.changeLanguage(LANGUAGES.THAI);

    mockUseGetPitchChecklistQuery.mockReturnValue({
      data: {
        ...mockedPitchChecklist,
        sections: [
          {
            ...mockedPitchChecklist.sections[0],
            labelTh: '',
            items: [
              {
                ...mockedPitchChecklist.sections[0].items[0],
                labelTh: '',
              },
            ],
          },
          mockedPitchChecklist.sections[1],
        ],
      },
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(
      <PitchChecklistPanel
        leadName="leads/fakeLeadId"
        isEditable
        isExpanded
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByText('1. Greeting')).toBeInTheDocument();
    expect(screen.getByText('2. ปิดบทสนทนา')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm customer name')).toBeInTheDocument();
    expect(screen.getByLabelText('ขอบคุณลูกค้า')).toBeInTheDocument();
  });

  test('falls back to Thai labels when English labels are missing', () => {
    mockUseGetPitchChecklistQuery.mockReturnValue({
      data: {
        ...mockedPitchChecklist,
        sections: [
          mockedPitchChecklist.sections[0],
          {
            ...mockedPitchChecklist.sections[1],
            labelEn: '',
            items: [
              {
                ...mockedPitchChecklist.sections[1].items[0],
                labelEn: '',
              },
            ],
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(
      <PitchChecklistPanel
        leadName="leads/fakeLeadId"
        isEditable
        isExpanded
        onToggle={jest.fn()}
      />
    );

    expect(screen.getByText('2. ปิดบทสนทนา')).toBeInTheDocument();
    expect(screen.getByLabelText('ขอบคุณลูกค้า')).toBeInTheDocument();
  });
});
