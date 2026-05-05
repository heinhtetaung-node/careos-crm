import React from 'react';
import { render } from '@testing-library/react';
import DocumentIcon from '../DocumentIcon';

test('should render icon correctly', () => {
  render(<DocumentIcon className="test" fillColor="white" />);
});
