import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';
import flagsmithConfig from 'config/flagsmithConfig';
import { mockUseFlags } from 'shared/helper/flagsmith';
import getApiEndpoint from 'utils/endpointHelper';

import InsureInfoButton from './InsureInfoButton';

var mockRemoveFn: jest.Mock;

jest.mock('shared/helper/SessionStorage', () => {
  mockRemoveFn = jest.fn();
  return {
    ...jest.requireActual('shared/helper/SessionStorage'),
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getItemByKey: jest.fn(),
      removeItemByKey: mockRemoveFn,
    })),
  };
});

describe('<InsureInfoButton />', () => {
  beforeEach(() => {
    mockRemoveFn.mockClear();
  });
  test('check if the component is not disable when disable prop is not provided', () => {
    render(<InsureInfoButton />);
    expect(
      screen.getByRole('button', { name: 'text.viewPackages' })
    ).not.toBeDisabled();
  });
  test('check if the component disable when disable prop is provided', () => {
    render(<InsureInfoButton isDisabled />);
    expect(
      screen.getByRole('button', { name: 'text.viewPackages' })
    ).toBeDisabled();
  });
  test('show package listing button', () => {
    render(<InsureInfoButton />);
    expect(screen.queryByTestId('package-listing-btn')).toBeInTheDocument();
  });
  test('should clear local storage if click view packages', async () => {
    render(<InsureInfoButton />);
    await user.click(screen.getByTestId('package-listing-btn'));
    expect(mockRemoveFn).toHaveBeenCalledWith('PACKAGE_FILTER-');
  });
});
