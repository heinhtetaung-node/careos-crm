import { createRef, useRef } from 'react';
import { isElementInViewport } from 'utils/window';

test('should return false if passed in null', () => {
  const ref = createRef<HTMLDivElement>();
  const result = isElementInViewport(ref);
  expect(result).toBe(false);
});
