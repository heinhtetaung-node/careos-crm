import { render, screen } from '@testing-library/react';
import React from 'react';

import RenderInputDateItem from './RenderInputDateItem';

describe('<RenderInputDateItem />', () => {
  it('test with isFieldDisabled Flag', () => {
    render(
      <RenderInputDateItem
        value="2022-02-02"
        isFieldDisabled
        onUpdateOrder={jest.fn()}
      />
    );
    expect(screen.getByTestId('disabled-datefield')).toHaveTextContent(
      '02/02/2022 (2565)'
    );
  });
});
