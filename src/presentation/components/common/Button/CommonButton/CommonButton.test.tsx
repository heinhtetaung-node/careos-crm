import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import CommonButton from '.';

describe('Test <CommonButton/>', () => {
  it('Test <CommonButton/> render successfully', () => {
    render(<CommonButton color="default">Default</CommonButton>);
    screen.getByRole('button', { name: 'Default' });
  });
});
