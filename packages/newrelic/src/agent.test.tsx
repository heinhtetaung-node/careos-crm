import { renderHook, waitFor } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';

import { mockNewRelic } from './__mocks__/newrelic';
import NewRelicSingleton from './agent';
import { NewRelicProvider, useNewRelic } from './provider';

describe('NewRelicSingleton initialization', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    NewRelicSingleton.clearInstance();
    jest.useRealTimers();
  });

  it('should initialize the newrelic instance', () => {
    // @ts-expect-error newrelic is set to undefined for testing purposes
    window.newrelic = undefined;
    const nrAgent = NewRelicSingleton.getInstance();
    expect(nrAgent.isAgentReady()).toBe(false);

    // Simulate a delay in assigning window.newrelic
    setTimeout(() => {
      window.newrelic = mockNewRelic;
    }, 200);

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    // Wait for the window.newrelic to be assigned
    expect(nrAgent.isAgentReady()).toBe(true);
  });

  it('should queue actions when newrelic is not ready', () => {
    // @ts-expect-error newrelic is set to undefined for testing purposes
    window.newrelic = undefined;
    const nrAgent = NewRelicSingleton.getInstance();
    expect(nrAgent.isAgentReady()).toBe(false);
    const action = jest.fn();
    nrAgent.queueAction(action);
    expect(action).not.toHaveBeenCalled();

    // Simulate a delay in assigning window.newrelic
    setTimeout(() => {
      window.newrelic = mockNewRelic;
    }, 500);

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    // Wait for the window.newrelic to be assigned
    expect(newrelic).toBe(window.newrelic);
    expect(action).toHaveBeenCalled();
    expect(nrAgent.isAgentReady()).toBe(true);
  });
});

describe('NewRelicSingleton functionality', () => {
  let nrAgent: NewRelicSingleton;

  beforeEach(() => {
    window.newrelic = mockNewRelic;
    nrAgent = NewRelicSingleton.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call noticeError method with the provided error', () => {
    const err = new Error('Test error');
    nrAgent.queueAction((agent) => agent.noticeError(err));
    expect(mockNewRelic.noticeError).toHaveBeenCalledWith(err);
  });

  it('should return the same instance', () => {
    const instance = NewRelicSingleton.getInstance();
    expect(nrAgent).toBe(instance);
  });

  it('should instantiate without error', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <NewRelicProvider>{children}</NewRelicProvider>
    );
    const { result } = renderHook(() => useNewRelic(), { wrapper });

    // Now you can test your hook's functionality
    expect(result.current).toBeDefined();

    const testErr = new Error('Test error');

    // If your hook has a function that changes some state, you can call it and check the changes:
    waitFor(() => {
      const { nrAgent: agent } = result.current;
      agent.noticeError(testErr);
    });
    expect(mockNewRelic.noticeError).toHaveBeenCalledWith(testErr);
  });
});

describe('useNewRelic', () => {
  let nrAgent: ReturnType<typeof useNewRelic>['nrAgent'];
  beforeEach(() => {
    window.newrelic = mockNewRelic;
    const wrapper = ({ children }: PropsWithChildren) => (
      <NewRelicProvider>{children}</NewRelicProvider>
    );
    const { result } = renderHook(() => useNewRelic(), { wrapper });
    nrAgent = result.current.nrAgent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap the noticeError method', () => {
    const testErr = new Error('Test error');
    waitFor(() => {
      nrAgent.noticeError(testErr);
    });
    expect(mockNewRelic.noticeError).toHaveBeenCalledWith(testErr);
  });

  it('should wrap the setPageViewName method', () => {
    const pageViewName = 'Test Page';
    const host = 'https://example.com';
    waitFor(() => {
      nrAgent.setPageViewName(pageViewName, host);
    });
    expect(mockNewRelic.setPageViewName).toHaveBeenCalledWith(
      pageViewName,
      host
    );
  });

  it('should wrap the setCustomAttribute method', () => {
    const attributeName = 'attribute';
    const attributeValue = 'value';
    waitFor(() => {
      nrAgent.setCustomAttribute(attributeName, attributeValue);
    });
    expect(mockNewRelic.setCustomAttribute).toHaveBeenCalledWith(
      attributeName,
      attributeValue
    );
  });

  it('should wrap the addPageAction method', () => {
    const actionName = 'Test Action';
    const actionAttributes = { key: 'value' };
    waitFor(() => {
      nrAgent.addPageAction(actionName, actionAttributes);
    });
    expect(mockNewRelic.addPageAction).toHaveBeenCalledWith(
      actionName,
      actionAttributes
    );
  });

  it('should wrap the interaction method', () => {
    waitFor(() => {
      nrAgent.interaction();
    });
    expect(mockNewRelic.interaction).toHaveBeenCalled();
  });

  it('should wrap the setUserId method', () => {
    const userId = 'testUser';
    waitFor(() => {
      nrAgent.setUserId(userId);
    });
    expect(mockNewRelic.setUserId).toHaveBeenCalledWith(userId);
  });

  it('should set user attributes', () => {
    const user = {
      humanId: '123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      userId: 'johndoe',
    };
    waitFor(() => {
      nrAgent.setUserAttributes(user);
    });
    expect(mockNewRelic.setUserId).toHaveBeenCalledWith(user.humanId);
    expect(mockNewRelic.setCustomAttribute).toHaveBeenCalledTimes(4);
    expect(mockNewRelic.setCustomAttribute).toHaveBeenNthCalledWith(
      1,
      'name',
      `${user.firstName} ${user.lastName}`
    );
  });
});
