import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from 'presentation/redux/store';

import useOrderSubmissionState from '../useOrderSubmissionState';

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={store as any}>{children}</Provider>
);

test('should useOrderSubmissionState behavior run well', () => {
  const response = renderHook(() => useOrderSubmissionState(), { wrapper });
  expect(response.result).toBeDefined();
});
