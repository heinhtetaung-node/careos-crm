import React from 'react';
import clsx from 'clsx';

interface Props {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  extraClasses?: string;
}

function CustomModal({ children, show, onClose, extraClasses }: Props) {
  return (
    <div
      className={clsx(
        'z-[10] text-black fixed p-4 h-full inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50',
        [!show && 'hidden']
      )}
    >
      <div
        className={clsx(
          'bg-white sm:h-fit p-6 rounded-xl shadow-lg w-full h-[620px] overflow-scroll relative',
          [extraClasses]
        )}
      >
        <div className="w-full max-h-screen">
          {children}
          <br />
          <div
            className="close-btn absolute bg-white h-5 top-5 right-1 cursor-pointer"
            onClick={() => onClose()}
          >
            <svg
              className="MuiSvgIcon-root"
              focusable="false"
              viewBox="0 0 24 24"
              aria-hidden="true"
              data-testid="close-button"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomModal;
