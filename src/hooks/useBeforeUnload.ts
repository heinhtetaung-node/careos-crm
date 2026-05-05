import { useCallback, useEffect } from 'react';

/**
 * A React hook that listens for the `beforeunload` event.
 *
 * @param {boolean} enabled - A boolean or a function that returns a boolean. If the
 * function returns `false`, the event will be prevented.
 * @param {string | undefined} message - An optional message to display in the dialog.
 */
export default function useBeforeUnload(
  enabled: boolean | (() => boolean) = true,
  message?: string
) {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      const finalEnabled = typeof enabled === 'function' ? enabled() : true;

      if (!finalEnabled) {
        return;
      }

      event.preventDefault();

      if (message) {
        // eslint-disable-next-line no-param-reassign
        event.returnValue = message;
      }

      // eslint-disable-next-line consistent-return
      return message;
    },
    [enabled, message]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('beforeunload', handler);

    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled, handler]);
}
