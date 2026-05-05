import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import MarkImportantButton from '.';

var mockedSelector: jest.Mock;

jest.mock('presentation/redux/selectors/lead', () => {
  const mockedFn = jest.fn();
  mockedSelector = mockedFn;
  return {
    useGetLeadSelector: mockedFn,
  };
});

describe('MarkImportantButton', () => {
  beforeEach(() => mockedSelector.mockClear());

  test('should disable when disable prop is provided', () => {
    mockedSelector.mockReturnValue({
      important: false,
      name: '',
    });
    render(<MarkImportantButton isDisabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('should show add star if lead.important is false', () => {
    mockedSelector.mockReturnValue({
      important: false,
      name: '',
    });
    render(<MarkImportantButton />);
    expect(screen.getByRole('button')).toHaveTextContent('text.addStar');
  });

  test('should show remove star if lead.important is true', () => {
    mockedSelector.mockReturnValue({
      important: true,
      name: '',
    });
    render(<MarkImportantButton />);
    expect(screen.getByRole('button')).toHaveTextContent('text.removeStar');
  });
});
