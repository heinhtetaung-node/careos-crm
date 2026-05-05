import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import SalesNeedsToFix from './SalesNeedsToFix';

const toggleOpen = jest.fn();
const questionEditable = {
  group: 'Contact details',
  label: 'Email',
  qId: 'haveCustomerEmail',
};
const questionNotEditable = {
  group: 'Introduction of company and agent name',
  label: 'Introduction of company and agent name',
  qId: 'introductionCompanyAndAgent',
};

const props = {
  open: true,
  toggleOpen,
};

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  getI18n: () => ({
    t: (str: string) => str,
  }),
}));

describe('SalesNeedsToFix dialog opens - ', () => {
  it('renders with popup title', async () => {
    render(<SalesNeedsToFix {...props} question={questionEditable} />);
    expect(screen.getByTestId('sales-needs-to-fix')).toBeInTheDocument();
    expect(screen.getByText('Contact details - Email')).toBeInTheDocument();
  });
  it('displays 2 radio buttons and comment input when QC field is editable', async () => {
    render(<SalesNeedsToFix {...props} question={questionEditable} />);
    const newOption = screen.getAllByRole('radio')[1];
    await userEvent.click(newOption);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
  it('displays only comment input when QC field is not editable', async () => {
    render(<SalesNeedsToFix {...props} question={questionNotEditable} />);
    const options = screen.queryAllByRole('radio');
    expect(options).toHaveLength(0);
  });
  it("show 'Update data' in dialog title for driver", () => {
    render(<SalesNeedsToFix {...props} question={{ groupId: 'driver' }} />);
    expect(screen.getByText('qc.updateData')).toBeInTheDocument();
  });
});

describe('SalesNeedsToFix dialog closes - ', () => {
  it('clicking Update raio button', async () => {
    render(<SalesNeedsToFix {...props} question={questionEditable} />);
    const newOption = screen.getAllByRole('radio')[0];
    await userEvent.click(newOption);
    expect(toggleOpen).toHaveBeenCalled();
  });
  it('clicking the close icon button', async () => {
    render(<SalesNeedsToFix {...props} question={questionEditable} />);
    const closeBtn = screen.getAllByRole('button')[0];
    await userEvent.click(closeBtn);
    expect(toggleOpen).toHaveBeenCalled();
  });
});

describe('SalesNeedsToFix submits comment - ', () => {
  it('clicking Update raio button', async () => {
    render(<SalesNeedsToFix {...props} question={questionEditable} />);
    const textbox = screen.getByRole('textbox');
    await userEvent.type(textbox, 'abc');
    const submit = screen.getByTestId('form-button');
    await userEvent.click(submit);
    await waitFor(() => {
      expect(toggleOpen).toHaveBeenCalled();
      expect(textbox).toHaveValue('');
    });
  });
  it('clicking the close icon button', async () => {
    render(
      <SalesNeedsToFix
        {...props}
        question={{ ...questionEditable, name: 'testname' }}
      />
    );
    const textbox = screen.getByRole('textbox');
    await userEvent.type(textbox, 'abc');
    const submit = screen.getByTestId('form-button');
    await userEvent.click(submit);
    await waitFor(() => {
      expect(toggleOpen).toHaveBeenCalled();
      expect(textbox).toHaveValue('');
    });
  });
});
