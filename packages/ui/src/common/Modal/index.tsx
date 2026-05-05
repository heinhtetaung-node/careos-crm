import clsx from 'clsx';
import React, { PropsWithChildren, useEffect } from 'react';

import { CloseIcon } from '@alphafounders/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  hasCloseButton?: boolean;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  dataTestId?: string;
}

function Modal({
  isOpen,
  onClose,
  title,
  hasCloseButton = true,
  children,
  size = 'medium',
  dataTestId = 'common-modal-component',
}: PropsWithChildren<ModalProps>) {
  const handleOnClick = () => {
    if (hasCloseButton) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      className="w-full h-full bg-transparent/30 backdrop-blur-sm border-0 backdrop-grayscale-0 m-0 p-0 fixed z-[1300] inset-0"
      data-testid={dataTestId}
    >
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
            className={clsx(
              'relative transform rounded-lg p-5 text-left transition-all',
              {
                'max-w-sm w-sm': size === 'small',
                'max-w-lg w-lg': size === 'medium',
                'max-w-full w-full': size === 'large',
              }
            )}
          >
            <div className="header-section overflow-y-auto rounded-t-lg">
              {hasCloseButton && (
                <span
                  className="absolute top-0 right-0 w-[36px] h-[36px] rounded-full z-30 bg-white cursor-pointer flex items-center justify-center"
                  onClick={handleOnClick}
                >
                  <CloseIcon className="w-4 h-4" />
                </span>
              )}
              {title && (
                <div className="bg-primary text-white min-h-[50px] flex justify-center items-center font-bold text-lg">
                  {title}
                </div>
              )}
            </div>
            <div
              className={clsx('p-[30px] bg-white rounded-b-lg shadow-xl', {
                'rounded-t-lg': !title,
              })}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default Modal;
