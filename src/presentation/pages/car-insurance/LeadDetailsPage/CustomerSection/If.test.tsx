import { render } from '@testing-library/react';
import React from 'react';

import If from './If';

test('render component LeadScheduleModal view successfully', () => {
  const props = {
    condition: false,
  };

  const { getByTestId } = render(<If {...props} />);
  expect(getByTestId('test-component')).toBeTruthy();
});
