import { Button } from '@alphafounders/ui';
import clsx from 'clsx';
import React from 'react';

import Dialog from 'presentation/components/common/Dialog';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  isError?: boolean;
  setIsOpen: (isOpen: boolean) => void;
  icon?: React.ReactElement;
  title?: string;
  content: string | React.ReactElement;
  showCloseBtn?: boolean;
  actionButton?: React.ReactElement;
  id: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  width?: number;
  blueTitle?: string;
  showCloseBtnText?: string;
  actionButtonShowFirst?: boolean;
}

function StatusDialog({
  isOpen,
  isLoading,
  isError,
  setIsOpen,
  icon,
  title,
  content,
  showCloseBtn,
  actionButton,
  id,
  maxWidth,
  width,
  blueTitle,
  showCloseBtnText,
  actionButtonShowFirst,
}: Props) {
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <Dialog
      open={isOpen}
      maxWidth={maxWidth ?? 'xs'}
      data-testid="create-dialog"
      color="default"
      formId="create-dialog"
      handleToggle={() => setIsOpen(false)}
      content={
        <div
          data-testid={`${id}`}
          className={clsx(
            'flex  h-auto pt-2 pb-2 items-center justify-center flex-col',
            width ? `w-[${width}px]` : 'w-auto'
          )}
        >
          {blueTitle && (
            <div
              className="rounded-lg absolute top-0 w-full rounded-b-none text-white text-center font-bold bg-primary py-4 text-sm"
              id="preview-header"
            >
              {blueTitle}
            </div>
          )}
          {icon}
          {title && (
            <h3 className={clsx('text-md', [isError && 'text-red-500'])}>
              {title}
            </h3>
          )}
          <div className="text-center whitespace-pre-wrap">{content}</div>
          <div className="flex w-42 mt-4 justify-between items-center">
            {actionButtonShowFirst && <>{actionButton}</>}
            {showCloseBtn && (
              <div className="p-0 w-auto flex flex-col justify-center">
                <div className="mr-2 ml-2 w-auto h-auto">
                  <Button
                    variant="secondary"
                    className="uppercase h-9 px-6 font-sans"
                    dataTestId="close-btn"
                    onClick={() => setIsOpen(false)}
                    text={showCloseBtnText || getString('text.close')}
                  />
                </div>
              </div>
            )}
            {!actionButtonShowFirst && <>{actionButton}</>}
          </div>
        </div>
      }
    />
  );
}

export default StatusDialog;
