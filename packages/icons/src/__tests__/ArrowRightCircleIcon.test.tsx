import React from 'react';
import { render } from '@testing-library/react';
import ArrowRightCircleIcon from '../ArrowRightCircleIcon';

test('should render icon correctly', () => {
  render(<ArrowRightCircleIcon className="test" fillColor="white" />);
});
