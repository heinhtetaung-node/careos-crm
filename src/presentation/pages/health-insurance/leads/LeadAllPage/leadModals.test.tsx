import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import LeadModals from './leadModals';

// Mock leaf UI/components to keep tests focused and lightweight
jest.mock('presentation/components/common/AssignLead', () => () => (
  <div data-testid="assign-lead" />
));
jest.mock('presentation/components/FilterPanel', () => (props: any) => (
  <div data-testid="filter-panel" {...props} />
));
jest.mock(
  'presentation/components/modal/LeadScheduleModal/NewLeadScheduleModal',
  () => (props: any) => <div data-testid="new-lead-schedule-modal" {...props} />
);
jest.mock('./columnDragAndDrop', () => () => (
  <div data-testid="drag-and-sort" />
));
jest.mock('presentation/components/common/Autocomplete', () => () => (
  <div data-testid="autocomplete" />
));

// Mock helpers/data/hooks referenced by the modals
jest.mock('./config', () => ({
  getFields: jest.fn(() => []),
}));
jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));
jest.mock('data/repository/admin/team/cloud', () => ({
  __esModule: true,
  default: {
    getTeamsByRole: jest.fn(() => ({
      subscribe: (_fn: (data: any) => void) => ({ unsubscribe: jest.fn() }),
    })),
  },
}));
jest.mock('data/slices/gffSlice', () => ({
  useLazyAssignUserSearchQuery: jest.fn(() => [jest.fn()]),
}));
jest.mock('data/slices/sourceSlices/sourceSlices', () => ({
  useGetSourcesV2Query: jest.fn(() => ({
    data: { sources: [] },
    isLoading: false,
  })),
}));
jest.mock('data/slices/userSlice', () => ({
  useGetUsersQuery: jest.fn(() => ({ data: { users: [] } })),
}));
jest.mock('data/slices/insurerSlice', () => ({
  useGetAllInsurersByStreamingQuery: jest.fn(() => ({
    data: { insurers: [] },
  })),
}));

const baseProps = {
  handleModal: jest.fn(),
  refetch: jest.fn(),
};

describe('<LeadModals />', () => {
  it('renders Assign modal when type is "assign"', () => {
    render(
      <LeadModals
        {...baseProps}
        modalInfo={{
          type: 'assign',
          show: true,
          data: { buttonState: [{ ids: ['1'] }, { ids: [], unassign: false }] },
        }}
        selectedAgents={[]}
      />
    );
    expect(screen.getByTestId('assign-lead')).toBeInTheDocument();
  });

  it('renders Filter modal when type is "filter"', () => {
    render(
      <LeadModals
        {...baseProps}
        modalInfo={{ type: 'filter', show: true }}
        handleSubmit={jest.fn()}
        initialValues={{}}
      />
    );
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
  });

  it('renders Settings modal when type is "settings"', () => {
    render(
      <LeadModals
        {...baseProps}
        modalInfo={{ type: 'settings', show: true }}
        handleColSettings={jest.fn()}
        columns={[]}
      />
    );
    expect(screen.getByTestId('drag-and-sort')).toBeInTheDocument();
  });

  it('renders Save modal when type is "save"', () => {
    render(
      <LeadModals {...baseProps} modalInfo={{ type: 'save', show: true }} />
    );
    // Two autocomplete fields should render
    expect(screen.getAllByTestId('autocomplete')).toHaveLength(2);
  });

  it('renders Appointment modal when type is "appointment"', () => {
    render(
      <LeadModals
        {...baseProps}
        modalInfo={{ type: 'appointment', show: true }}
      />
    );
    expect(screen.getByTestId('new-lead-schedule-modal')).toBeInTheDocument();
  });

  it('returns null for unknown modal type', () => {
    const { container } = render(
      <LeadModals {...baseProps} modalInfo={{ type: 'unknown', show: true }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
