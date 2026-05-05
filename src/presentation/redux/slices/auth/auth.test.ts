import { UnknownAction } from 'redux';

import reducer, { authorizeSuccess } from '.';

const initialState = {
  data: {
    user: undefined,
  },
};

test('should handle initial state', () => {
  expect(reducer(undefined, {} as UnknownAction)).toEqual(initialState);
});

test('should handle authorize success', () => {
  expect(reducer(initialState, authorizeSuccess({ userName: 'John' }))).toEqual(
    {
      data: {
        user: { userName: 'John' },
      },
    }
  );
});
