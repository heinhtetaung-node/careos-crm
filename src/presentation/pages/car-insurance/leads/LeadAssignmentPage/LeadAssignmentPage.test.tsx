import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import LeadAssignmentPage from './index';

describe('<LeadAssignmentPage Component/>', () => {
  it('will be mounted correctly', () => {
    render(<LeadAssignmentPage />);
  });
});
