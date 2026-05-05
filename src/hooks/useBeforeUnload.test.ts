import { renderHook } from '@testing-library/react';
import useBeforeUnload from './useBeforeUnload';

describe('useBeforeUnload', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('event listener management', () => {
    it('should add beforeunload event listener when enabled is true', () => {
      renderHook(() => useBeforeUnload(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should not add beforeunload event listener when enabled is false', () => {
      renderHook(() => useBeforeUnload(false));

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useBeforeUnload(true));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should add event listener when enabled changes from false to true', () => {
      const { rerender } = renderHook(
        ({ enabled }) => useBeforeUnload(enabled),
        {
          initialProps: { enabled: false },
        }
      );

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should remove event listener when enabled changes from true to false', () => {
      const { rerender } = renderHook(
        ({ enabled }) => useBeforeUnload(enabled),
        {
          initialProps: { enabled: true },
        }
      );

      const handler = addEventListenerSpy.mock.calls[0][1];

      rerender({ enabled: false });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        handler
      );
    });
  });

  describe('event handler behavior', () => {
    it('should prevent default and set returnValue when message is provided', () => {
      const message = 'Are you sure you want to leave?';
      renderHook(() => useBeforeUnload(true, message));

      const handler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      const returnValue = handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe(message);
      expect(returnValue).toBe(message);
    });

    it('should prevent default but not set returnValue when no message is provided', () => {
      renderHook(() => useBeforeUnload(true));

      const handler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      const returnValue = handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe('');
      expect(returnValue).toBeUndefined();
    });

    it('should not prevent default when enabled function returns false', () => {
      const enabledFn = jest.fn(() => false);
      renderHook(() => useBeforeUnload(enabledFn));

      const handler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      handler(mockEvent);

      expect(enabledFn).toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent default when enabled function returns true', () => {
      const enabledFn = jest.fn(() => true);
      renderHook(() => useBeforeUnload(enabledFn));

      const handler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      handler(mockEvent);

      expect(enabledFn).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('default behavior', () => {
    it('should default enabled to true when no parameters are provided', () => {
      renderHook(() => useBeforeUnload());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should work with default enabled and custom message', () => {
      const message = 'Custom warning message';
      renderHook(() => useBeforeUnload(undefined, message));

      const handler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe(message);
    });
  });

  describe('handler updates', () => {
    it('should update handler when message changes', () => {
      const { rerender } = renderHook(
        ({ message }) => useBeforeUnload(true, message),
        {
          initialProps: { message: 'First message' },
        }
      );

      const firstHandler = addEventListenerSpy.mock.calls[0][1];
      const firstMockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      firstHandler(firstMockEvent);
      expect(firstMockEvent.returnValue).toBe('First message');

      rerender({ message: 'Second message' });

      // Should have removed old handler and added new one
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        firstHandler
      );

      const secondHandler =
        addEventListenerSpy.mock.calls[
          addEventListenerSpy.mock.calls.length - 1
        ][1];
      const secondMockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      secondHandler(secondMockEvent);
      expect(secondMockEvent.returnValue).toBe('Second message');
    });

    it('should update handler when enabled function changes', () => {
      const firstEnabledFn = jest.fn(() => true);
      const { rerender } = renderHook(
        ({ enabled }) => useBeforeUnload(enabled),
        {
          initialProps: { enabled: firstEnabledFn },
        }
      );

      const firstHandler = addEventListenerSpy.mock.calls[0][1];
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: '',
      } as unknown as BeforeUnloadEvent;

      firstHandler(mockEvent);
      expect(firstEnabledFn).toHaveBeenCalled();

      const secondEnabledFn = jest.fn(() => true);
      rerender({ enabled: secondEnabledFn });

      const secondHandler =
        addEventListenerSpy.mock.calls[
          addEventListenerSpy.mock.calls.length - 1
        ][1];

      secondHandler(mockEvent);
      expect(secondEnabledFn).toHaveBeenCalled();
    });
  });
});
