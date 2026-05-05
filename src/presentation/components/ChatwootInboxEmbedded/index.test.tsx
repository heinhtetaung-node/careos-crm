import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ChatwootInboxEmbedded from './index';

let mockChatwootUrl = 'https://chatwoot.example/widget';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('utils/env', () => ({
  get chatwootUrl() {
    return mockChatwootUrl;
  },
}));

describe('ChatwootInboxEmbedded', () => {
  let getBoundingClientRectSpy: jest.SpyInstance;
  const originalResizeObserver = global.ResizeObserver;

  beforeEach(() => {
    mockChatwootUrl = 'https://chatwoot.example/widget';
    getBoundingClientRectSpy = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        left: 400,
        top: 0,
        width: 100,
        height: 40,
        right: 500,
        bottom: 40,
        x: 400,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    getBoundingClientRectSpy.mockRestore();
    global.ResizeObserver = originalResizeObserver;
    document.documentElement.style.removeProperty(
      '--chatwoot-toggle-clearance'
    );
  });

  it('does not render when chatwootUrl is missing', () => {
    mockChatwootUrl = '';

    const { container } = render(<ChatwootInboxEmbedded />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('widget.chatWithCustomer')).not.toBeInTheDocument();
    expect(
      document.documentElement.style.getPropertyValue(
        '--chatwoot-toggle-clearance'
      )
    ).toBe('');
  });

  it('sets --chatwoot-toggle-clearance from toggle position', async () => {
    render(<ChatwootInboxEmbedded />);

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--chatwoot-toggle-clearance'
        )
      ).toBe('800px');
    });
  });

  it('updates clearance on window resize', async () => {
    render(<ChatwootInboxEmbedded />);

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--chatwoot-toggle-clearance'
        )
      ).toBeTruthy();
    });

    getBoundingClientRectSpy.mockReturnValue({
      left: 200,
      top: 0,
      width: 100,
      height: 40,
      right: 300,
      bottom: 40,
      x: 200,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1000,
    });
    fireEvent.resize(window);

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--chatwoot-toggle-clearance'
        )
      ).toBe('800px');
    });
  });

  it('uses ResizeObserver when available', async () => {
    const observe = jest.fn();
    const disconnect = jest.fn();

    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe,
      disconnect,
    })) as unknown as typeof ResizeObserver;

    const { unmount } = render(<ChatwootInboxEmbedded />);

    await waitFor(() => {
      expect(observe).toHaveBeenCalled();
    });

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });

  it('removes --chatwoot-toggle-clearance on unmount', async () => {
    const removeSpy = jest.spyOn(
      document.documentElement.style,
      'removeProperty'
    );
    const { unmount } = render(<ChatwootInboxEmbedded />);

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue(
          '--chatwoot-toggle-clearance'
        )
      ).toBeTruthy();
    });

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('--chatwoot-toggle-clearance');
    removeSpy.mockRestore();
  });

  it('renders toggle label and iframe after checkbox is checked', () => {
    render(<ChatwootInboxEmbedded />);

    expect(screen.getByText('widget.chatWithCustomer')).toBeInTheDocument();

    fireEvent.click(screen.getByText('widget.chatWithCustomer'));

    expect(screen.getByTitle('Chatwoot')).toHaveAttribute(
      'src',
      'https://chatwoot.example/widget'
    );
  });
});
