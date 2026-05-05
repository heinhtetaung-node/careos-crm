import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import LeadPageAddLead from '.';

const handleCloseModal = jest.fn();
const callBackAddLead = jest.fn();

describe('<ImportNewLead Component/>', () => {
  beforeEach(() => {
    render(
      <LeadPageAddLead
        callBackAddLead={callBackAddLead}
        close={handleCloseModal}
      />
    );
  });

  it('should allow user to click the cancel button and close the modal', async () => {
    expect(screen.getByTestId('add-lead-modal-component')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'text.cancelButton' }));
    expect(handleCloseModal).toHaveBeenCalled();
  });

  it('should not be able to click the submit button until user adds all required data.', () => {
    expect(screen.getByRole('button', { name: 'text.add' })).toBeDisabled();
  });
});
