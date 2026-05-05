import React from 'react';
import { render } from '@testing-library/react';
import CalenderIcon from '../CalenderIcon';

test('should render icon correctly', () => {
  render(<CalenderIcon className="test" fillColor="white" />);
});
