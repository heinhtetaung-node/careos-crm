import { render, screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import LanguageButton from '../../Buttons/LanguageButton';

import userEvent from '@testing-library/user-event';

describe('LanguageButton component', () => {
  const text = 'image';
  const testButton = 'testId';

  it('should override conflicting classnames', () => {
    render(
      <LanguageButton
        code="en"
        text={text}
        className="bg-secondary"
        dataTestId={testButton}
      />
    );

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByTestId(testButton)).toHaveClass(
      'bg-secondary text-primary'
    );
    expect(screen.getByTestId(testButton)).not.toHaveClass('bg-white');
  });

  it('should trigger onClick if onClick is provided', async () => {
    const mock = jest.fn();
    render(
      <LanguageButton
        code="en"
        text={text}
        onClick={mock}
        dataTestId={testButton}
      />
    );

    await userEvent.click(screen.getByTestId(testButton));
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(mock).toHaveBeenCalledWith('en');
  });

  it('should mark the button as selected', () => {
    render(
      <LanguageButton code="en" text={text} selected dataTestId={testButton} />
    );

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByTestId(testButton)).toHaveClass(
      'bg-primary text-white border-primary'
    );
  });
});
