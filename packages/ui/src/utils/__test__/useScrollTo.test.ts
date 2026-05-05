import { renderHook, act } from '@testing-library/react-hooks';

import useScrollTo from 'utils/useScrollTo';

it('should call the useScrollTo Hook', () => {
  const { result } = renderHook(() => useScrollTo());

  const [state, setScrollTo] = result.current;
  act(() => setScrollTo(true));

  expect(state).toStrictEqual({ current: null });
});
