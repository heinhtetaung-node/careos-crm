import { render, screen, renderHook, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';

import '@testing-library/jest-dom';
import { mockNewRelic } from './__mocks__/newrelic';
import { NewRelicProvider, useNewRelic } from './provider';

describe('NewRelicProvider', () => {
  beforeEach(() => {
    window.newrelic = mockNewRelic;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <NewRelicProvider>
        <div>Test Child</div>
      </NewRelicProvider>
    );

    const childElement = screen.getByText('Test Child');
    expect(childElement).toBeInTheDocument();
  });

  it('should throw an error when useNewRelic is used outside NewRelicProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    function Component() {
      useNewRelic();
      return <div>Test Component</div>;
    }

    expect(() => render(<Component />)).toThrow(
      'useNewRelic must be used within a NewRelicProvider'
    );
    (console.error as jest.Mock).mockRestore();
  });

  it('should call queueAction when queueAction is called', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <NewRelicProvider>{children}</NewRelicProvider>
    );
    const { result } = renderHook(() => useNewRelic(), { wrapper });
    const action = jest.fn();
    const { nrAgent } = result.current;
    waitFor(() => {
      nrAgent.queueAction(action);
    });

    expect(action).toHaveBeenCalled();
    expect(action).toHaveBeenCalledWith(window.newrelic);
    expect(action).toHaveBeenCalledTimes(1);
  });
});
