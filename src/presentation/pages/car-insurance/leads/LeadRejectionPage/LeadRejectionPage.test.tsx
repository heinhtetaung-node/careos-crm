import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import LeadRejectionPage from '.';

describe('<LeadRejectionPage Component/>', () => {
  it('will be mounted correctly', () => {
    render(<LeadRejectionPage />);
  });
});
