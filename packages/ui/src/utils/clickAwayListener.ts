import React, { useEffect } from 'react';

export default function ClickAwayListener(
  ref: React.RefObject<Element>,
  action: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (
        ref.current &&
        !ref.current.contains(event.target as HTMLButtonElement)
      ) {
        action();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [action, ref]);
}
