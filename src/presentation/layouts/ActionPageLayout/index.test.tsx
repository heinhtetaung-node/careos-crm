import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ActionPageLayout from '.';

describe('ActionPageLayout component', () => {
  const testTitle = 'test';
  const buttonText = 'Button';
  it('should call onBackClick function if provided.', async () => {
    const onBackClick = jest.fn();
    render(
      <ActionPageLayout
        title={testTitle}
        buttonText={buttonText}
        onBackClick={onBackClick}
      />
    );

    await waitFor(() => {
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeInTheDocument();
      userEvent.click(backButton);

      expect(onBackClick).toHaveBeenCalled();
    });
  });

  it('should not call onBackClick function if not provided.', async () => {
    const onBackClick = jest.fn();
    render(<ActionPageLayout title={testTitle} buttonText={buttonText} />);

    await waitFor(() => {
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeInTheDocument();
      userEvent.click(backButton);

      expect(onBackClick).not.toHaveBeenCalled();
    });
  });

  it('should call onButtonClick function if provided.', async () => {
    const onButtonClick = jest.fn();
    render(
      <ActionPageLayout
        title={testTitle}
        buttonText={buttonText}
        onButtonClick={onButtonClick}
      />
    );

    await waitFor(() => {
      const actionButton = screen.getByTestId('action-button');
      expect(actionButton).toBeInTheDocument();
      userEvent.click(actionButton);

      expect(onButtonClick).toHaveBeenCalled();
    });
  });

  it('should not call onButtonClick function if not provided.', async () => {
    const onButtonClick = jest.fn();
    render(
      <ActionPageLayout
        title={testTitle}
        buttonText={buttonText}
        // onButtonClick={onButtonClick}
      />
    );

    await waitFor(() => {
      const actionButton = screen.getByTestId('action-button');
      expect(actionButton).toBeInTheDocument();
      userEvent.click(actionButton);

      expect(onButtonClick).not.toHaveBeenCalled();
    });
  });
});
