import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import ApprovalHistory from '.';

describe('Test <ApprovalHistory />', () => {
  it('should render component', () => {
    const mockLeadId = 'leads/test';
    render(<ApprovalHistory id={mockLeadId} />);

    expect(
      screen.getByTestId('approvalHistory-table-component')
    ).toBeInTheDocument();
  });
});
