import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { render, screen } from '__tests__/rtl-test-utils';
import mockCarPackage from 'shared/helper/OrderCarPackageMock';
import OrderPolicy from 'shared/helper/OrderPolicyMockData';

import { policy, insurancePackage } from './__mockData__';

import Insurance from '.';

afterEach(() => {
  jest.clearAllMocks();
});
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
const dispatch = jest.fn();
(useDispatch as any).mockReturnValue(dispatch);

it.skip('Render Insurance editable content', () => {
  render(
    <Insurance
      isEditable
      policy={OrderPolicy.mockPolicyDetail}
      insurancePackage={mockCarPackage}
    />
  );
  const textboxes = screen.getAllByRole('textbox');
  expect(screen.getByText('text.insurancePackageTitle')).toBeTruthy();
  expect(textboxes).toBeTruthy();
});

it.skip('Render Insurance readonly content', () => {
  const policies = OrderPolicy.mockPolicyDetail;
  policies.motorItemType = '';
  policies.policyStartDate = '';
  render(<Insurance policy={policy} insurancePackage={mockCarPackage} />);
  expect(() => screen.getByRole('textbox')).toThrow();
});

jest.mock('data/slices/orderPolicySlice', () => ({
  useUpdatePolicyMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

it.skip('Insurance handle update', async () => {
  render(<Insurance isEditable policy={null} insurancePackage={null} />);
  const input = screen.getByTestId('insurance-adjusted-premium-input');
  userEvent.clear(input);
  await waitFor(() => {
    expect(input).toHaveValue('');
  });
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

test.skip('click on Handler', () => {
  jest.mock('lodash/debounce', () => ({
    _debounce: (fn: () => void) => {
      fn();
    },
  }));

  render(
    <Insurance
      isEditable
      policy={policy}
      policyId="O55576-1"
      insurancePackage={insurancePackage}
      orderId="55ae9146-1a25-4e10-bbe9-9f7cdd18643d"
    />
  );

  const element = screen.getByTestId('insurance-adjusted-premium-input');
  element.focus();
  userEvent.clear(element);
  userEvent.type(element, '12');
  element.blur();
  waitFor(
    () => {
      expect(element).toHaveDisplayValue('12');
    },
    { timeout: 5000 }
  );
});

const setState = jest.fn();
const useStateSpy = jest.spyOn(React, 'useState');
useStateSpy.mockImplementation((() => [
  { policyStartDate: '2009-01-01T00:00:00Z', adjustedPremium: '60' },
  setState,
]) as any);

test.skip('click on Handler with same value', () => {
  jest.mock('lodash/debounce', () => ({
    _debounce: (fn: () => void) => {
      fn();
    },
  }));

  jest.mock('./Insurance.helper', () => ({
    modifyPolicySaveData: jest.fn().mockReturnValue(false),
  }));

  render(
    <Insurance
      isEditable
      policy={policy}
      policyId="O55576-1"
      insurancePackage={insurancePackage}
      orderId="55ae9146-1a25-4e10-bbe9-9f7cdd18643d"
    />
  );

  const element = screen.getByTestId('insurance-adjusted-premium-input');
  waitFor(
    () => {
      expect(element).toHaveDisplayValue('60');
    },
    { timeout: 5000 }
  );
  element.focus();
  userEvent.clear(element);
  userEvent.type(element, '60');
  element.blur();

  waitFor(
    () => {
      expect(element).toHaveDisplayValue('60');
    },
    { timeout: 5000 }
  );
});
