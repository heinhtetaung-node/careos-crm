import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chatwootUrl } from 'utils/env';

export default function ChatwootInboxEmbedded() {
  const { t } = useTranslation();
  const [openChat, setOpenChat] = useState(false);
  const toggleRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (!chatwootUrl) {
      return undefined;
    }

    const updateToggleClearance = () => {
      const toggle = toggleRef.current;

      if (!toggle) {
        return;
      }

      const { left } = toggle.getBoundingClientRect();
      const clearance = Math.max(0, window.innerWidth - left);

      document.documentElement.style.setProperty(
        '--chatwoot-toggle-clearance',
        `${Math.round(clearance)}px`
      );
    };

    updateToggleClearance();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateToggleClearance())
        : null;

    if (toggleRef.current && resizeObserver) {
      resizeObserver.observe(toggleRef.current);
    }

    window.addEventListener('resize', updateToggleClearance);

    return () => {
      window.removeEventListener('resize', updateToggleClearance);
      resizeObserver?.disconnect();
      document.documentElement.style.removeProperty(
        '--chatwoot-toggle-clearance'
      );
    };
  }, []);

  return (
    chatwootUrl && (
      <div className="shadow-lg border border-solid border-neutral-200 fixed right-0 bottom-0 z-40 w-[65rem] h-[calc(100vh-7rem)] bg-white has-[:checked]:translate-y-0 translate-y-full transition-all duration-300 ease-in-out">
        <input
          type="checkbox"
          id="chat-toggle"
          className="hidden"
          onChange={(e) => setOpenChat(e.target.checked)}
        />
        <label
          htmlFor="chat-toggle"
          ref={toggleRef}
          className="absolute -top-7 right-10 z-50 cursor-pointer bg-primary text-white rounded-t-md uppercase font-medium px-6 py-1 hover:bg-primary/90"
        >
          {t('widget.chatWithCustomer')}
        </label>
        {openChat && (
          <iframe
            title="Chatwoot"
            className="w-full h-full border-0"
            src={chatwootUrl}
          />
        )}
      </div>
    )
  );
}
