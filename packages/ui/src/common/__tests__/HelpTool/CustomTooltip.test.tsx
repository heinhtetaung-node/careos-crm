import { render } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import CustomTooltip from '../../HelpTool/CustomTooltip';

describe('CustomTooltip', () => {
  it('renders tooltip with correct children', () => {
    const childElement = <div>Child element</div>;
    const { getByText } = render(<CustomTooltip>{childElement}</CustomTooltip>);
    expect(getByText('Child element')).toBeInTheDocument();
  });
});
