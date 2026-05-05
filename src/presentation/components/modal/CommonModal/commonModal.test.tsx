import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CommonModal from '.';

var mockedHandleCloseModal = jest.fn();

const initialProps = {
  children: 'common modal test',
  open: true,
  title: 'common modal test',
  handleCloseModal: mockedHandleCloseModal,
};

describe('<CommonModal Component/>', () => {
  it('will be mounted correctly', () => {
    render(<CommonModal {...initialProps} />);
  });

  it('should display title of modal', () => {
    render(<CommonModal {...initialProps} />);
    expect(screen.getByRole('heading')).toHaveTextContent(initialProps.title);
  });

  it('should click to button close', async () => {
    render(<CommonModal {...initialProps} />);
    await user.click(screen.getByTestId('close-button'));
    expect(mockedHandleCloseModal).toHaveBeenCalled();
  });
});

afterEach(() => {
  mockedHandleCloseModal.mockClear();
});
