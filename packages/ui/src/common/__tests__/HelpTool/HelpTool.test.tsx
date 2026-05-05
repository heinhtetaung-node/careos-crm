import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import HelpTool from '../../HelpTool';

describe('HelpTool', () => {
  test('renders tooltip icon with correct label', () => {
    render(<HelpTool tip="This is a tooltip" label="Help" />);

    const tooltipIcon = screen.getByTestId('tooltip-icon');
    const helpLabel = screen.getByText('Help');

    expect(tooltipIcon).toBeInTheDocument();
    expect(helpLabel).toBeInTheDocument();
  });

  test('tooltip is displayed when icon is clicked', async () => {
    render(<HelpTool tip="This is a tooltip" label="Help" />);

    const tooltipIcon = screen.getByTestId('tooltip-icon');

    await userEvent.click(tooltipIcon);
  });

  test('extra classes are applied to tooltip icon', () => {
    render(
      <HelpTool
        tip="This is a tooltip"
        label="Help"
        extraClasses="text-red-500"
      />
    );

    const tooltipIcon = screen.getByTestId('tooltip-icon');

    expect(tooltipIcon).toHaveClass('text-red-500');
  });
});
