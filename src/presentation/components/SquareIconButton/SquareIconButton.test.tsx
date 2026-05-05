import CheckIcon from '@material-ui/icons/Check';
import { render } from '@testing-library/react';
import React from 'react';

import SquareIconButton from '.';

describe('<SquareIconButton/> successfully render', () => {
  it('<SquareIconButton/> successfully render with default background and icon colors', () => {
    const { getByRole } = render(
      <SquareIconButton>
        <CheckIcon fontSize="small" />
      </SquareIconButton>
    );
    expect(getByRole('button')).toBeInTheDocument();
  });
});
