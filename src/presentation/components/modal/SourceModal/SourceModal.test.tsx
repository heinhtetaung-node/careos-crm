import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import SourceModal from './index';

function TestSourceModal() {
  return <SourceModal data={{ id: '101' }} close />;
}

describe('<SourceModal />', () => {
  it('renders', async () => {
    const { getByRole } = render(<TestSourceModal />);
    const noOptionBtn = getByRole('button', {
      name: 'hideOption.no',
    });
    expect(noOptionBtn).toBeInTheDocument();
  });
});
