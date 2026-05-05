import { render, screen } from '@testing-library/react';
import React from 'react';

import ErrorModal from '.';

const close = jest.fn();

describe('ErrorModal Component', () => {
  test('render error modal', () => {
    render(
      <ErrorModal
        close={close}
        errorTitle="Something went wrong"
        errorMsg="please try again"
      />
    );
    expect(screen.queryByTestId('error-modal')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('please try again')).toBeInTheDocument();
  });
  test('render error modal with error message', () => {
    render(<ErrorModal close={close} errorTitle="Something went wrong" />);
    expect(screen.queryByTestId('error-modal')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeInTheDocument();
  });
});
