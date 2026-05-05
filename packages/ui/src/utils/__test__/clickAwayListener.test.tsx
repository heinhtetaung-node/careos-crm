import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import ClickAwayListener from '../clickAwayListener';

test('should insert item at the fix interval', async () => {
  const mockAction = jest.fn();

  const ref = React.createRef<HTMLButtonElement>();
  render(
    <div data-testid="outside">
      <button type="button" ref={ref}>
        BTN
      </button>
    </div>
  );
  renderHook(() =>
    ClickAwayListener(
      {
        current: ref.current,
      },
      mockAction
    )
  );

  await userEvent.click(screen.getByTestId('outside'));
  expect(mockAction).toHaveBeenCalled();
});
