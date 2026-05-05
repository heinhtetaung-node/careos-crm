import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import InformationRow from '.';

const mockClickFn = jest.fn();
describe('<InformationRow />', () => {
  it('should render component correctly', async () => {
    render(
      <InformationRow
        plans="Mocked Plan Data"
        initialAmount="10000"
        subsequentAmount="12000"
        feeAmount="502"
        discountAmount="800"
        discountRate="5"
        netPremiumAmount="70000"
        handleOnClick={mockClickFn}
        isSelected={false}
      />
    );
    const row = screen.getByTestId('informationRow-container');
    expect(row).toBeInTheDocument();

    const inputRadio = screen.getByTestId('input-radio');
    expect(inputRadio).not.toBeChecked();
    await userEvent.click(row);
    await waitFor(() => {
      expect(mockClickFn).toHaveBeenCalled();
    });
  });
});
