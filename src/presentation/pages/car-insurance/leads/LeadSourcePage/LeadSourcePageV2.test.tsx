/* eslint-disable react/button-has-type */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import LeadSourcePage from './LeadSourcePageV2';

/* Mocks */
jest.mock('presentation/hooks/useTableList', () =>
  jest.fn().mockReturnValue({
    TableComponent: ({ ActionCellElements }: any) => (
      <ActionCellElements row={{}} />
    ),
    TopComponent: jest.fn(),
  })
);
jest.mock('data/slices/sourceSlices/sourceSlices', () => ({
  useGetSourcesV2Query: jest
    .fn()
    .mockReturnValue({ data: [], isLoading: false }),
  useUpdateSourceMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false }]),
  useCreateSourceMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { isLoading: false }]),
}));

jest.mock(
  'presentation/components/FilterPanel',
  () =>
    function ({ onSubmit, onReset }: any) {
      return (
        <>
          <button onClick={() => onSubmit({})}>Submit</button>
          <button onClick={() => onReset({})}>Reset</button>
        </>
      );
    }
);

describe('LeadSourcePage', () => {
  it('should render correctly', async () => {
    render(<LeadSourcePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'text.createSource' })
    );
    expect(screen.getByTestId('common-modal')).toBeInTheDocument();
  });
  it('shoul show edit modal', async () => {
    render(<LeadSourcePage />);
    await userEvent.click(screen.getByTestId('edit-button').children[0]);
    expect(screen.getByTestId('common-modal')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('common-modal')).getByText(
        'text.update Lead Source'
      )
    ).toBeInTheDocument();
  });
});
