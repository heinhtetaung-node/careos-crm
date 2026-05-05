import { render } from '@testing-library/react';
import React from 'react';

import {
  BellIcon,
  ViewDocumentIcon,
  InsertDocumentIcon,
  CreditCardIcon,
} from '../index';

// should add all icon tests in this file
test('should render bell icon', () => {
  render(<BellIcon />);
});
test('should render view document icon', () => {
  render(<ViewDocumentIcon />);
});
test('should render insert document icon', () => {
  render(<InsertDocumentIcon />);
});
test('should render credit card icon', () => {
  render(<CreditCardIcon />);
});
