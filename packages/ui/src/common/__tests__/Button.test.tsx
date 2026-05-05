import React from 'react';
import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button', () => {
  test('should not propagate click event if stopPropagating flag is on', async () => {
    const parentEleClickFn = jest.fn();
    const childEleClickFn = jest.fn();
    render(
      <div role="button" tabIndex={0} onClick={parentEleClickFn}>
        <Button text="button" onClick={childEleClickFn} stopPropagating />
      </div>
    );
    await user.click(screen.getByText('button'));
    expect(childEleClickFn).toHaveBeenCalled();
    expect(parentEleClickFn).not.toHaveBeenCalled();
  });
});
