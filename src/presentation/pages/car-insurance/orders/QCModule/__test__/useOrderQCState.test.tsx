import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from 'presentation/redux/store';

import useOrderQCState from '../useOrderQCState';

const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={store as any}>{children}</Provider>
);

test('should useOrderQCState behavior run well', () => {
  const response = renderHook(() => useOrderQCState(), { wrapper });

  expect(response.result).toBeDefined();
});
