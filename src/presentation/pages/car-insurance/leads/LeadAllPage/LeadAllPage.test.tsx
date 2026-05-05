import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import LeadAllPage from '.';

describe('<LeadAllPage Component/>', () => {
  it('will be mounted correctly', () => {
    render(<LeadAllPage />);
  });
});
