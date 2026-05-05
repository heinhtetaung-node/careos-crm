import React from 'react';
import user from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Select from '../Select';

describe('Select', () => {
  test('should not propagate click event if stopPropagating flag is on', async () => {
    const parentEleClickFn = jest.fn();
    render(
      <div role="button" tabIndex={0} onClick={parentEleClickFn}>
        <Select options={[]} value={1} onSelect={jest.fn()} stopPropagating />
      </div>
    );
    await user.click(screen.getByRole('combobox'));
    expect(parentEleClickFn).not.toHaveBeenCalled();
  });
});
