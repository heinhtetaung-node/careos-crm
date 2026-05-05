import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import CancelAppointmentModal from '.';

describe('<CancelAppointmentModal />', () => {
  test('should show loading during async function call', async () => {
    const mockFn = jest.fn().mockResolvedValue({});
    render(
      <CancelAppointmentModal
        handleOpenCloseModal={jest.fn()}
        handleRemoveAppointment={mockFn}
      />
    );
    await userEvent.click(screen.getByText('text.yes'));
    await waitFor(async () => {
      expect(mockFn).toHaveBeenCalled();
    });
    // const progressbar = await screen.findByRole('progressbar');
    // await waitFor(async () => {
    //   expect(progressbar).toBeInTheDocument();
    // });
    // await waitForElementToBeRemoved(progressbar);
  });
});
