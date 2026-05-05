import RemoveCircleOutlineRoundedIcon from '@material-ui/icons/RemoveCircleOutlineRounded';
import clsx from 'clsx';
import * as React from 'react';

import { getString } from 'presentation/theme/localization';

import IconButton from '../../Button/IconButton';

interface InputContainerProps {
  title: string;
  showAsterisk?: boolean;
  subText?: string;
  error?: string;
  children?: React.ReactNode;
  dataTestId?: string;
  showLabel?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isRemovable?: boolean;
  isSectionTitle?: boolean;
  hidden?: boolean;
  handleRemove?: (payload: any) => void;
  showPenIcon?: boolean;
  renderBy?: string;
}

function InputContainer({
  title,
  error,
  children,
  dataTestId,
  showAsterisk = false,
  showLabel = true,
  isReadOnly = false,
  isDisabled = false,
  isRemovable = false,
  isSectionTitle = false,
  subText,
  handleRemove,
  hidden = false,
  showPenIcon,
  renderBy,
}: InputContainerProps) {
  const onRemove = () => {
    if (isSectionTitle) return;
    if (isRemovable && handleRemove) {
      handleRemove(title);
    }
  };
  const showError = !isSectionTitle && Boolean(error);
  const showReadOnlyIcon = !isSectionTitle && isReadOnly;
  const showAsteriskChar = !isSectionTitle && showAsterisk;
  const showRemovable = !isSectionTitle && isRemovable;
  const showDisabled = !isSectionTitle && isDisabled;
  if (hidden) {
    return null;
  }
  return (
    <div
      className={clsx(
        'relative flex flex-wrap align-center w-full border-solid border-t-0 border-l-0 border-r-0 border-b-gray-200 border-b-[1px]',
        {
          'border-solid border-l-[2px] border-r-0 border-b-0 border-t-0 border-l-red-600':
            showError,
          'text-gray-400': showDisabled,
        }
      )}
      data-testid={dataTestId}
    >
      {showReadOnlyIcon && (
        <svg
          className="w-3 h-3 text-gray-200 absolute top-[-5px] right-[-8px] transform rotate-[-45deg]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 10 16"
        >
          <path d="M3.414 1A2 2 0 0 0 0 2.414v11.172A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1Z" />
        </svg>
      )}
      {(isSectionTitle || showLabel) && (
        <div
          className={clsx('flex w-1/2 justify-between', {
            label: !showRemovable,
          })}
        >
          <div className={clsx('flex items-center', { flex: showRemovable })}>
            {showRemovable && (
              <IconButton
                color="default"
                iconSize="m"
                btnSize="large"
                handleClick={onRemove}
                icon={<RemoveCircleOutlineRoundedIcon />}
              />
            )}

            <div className="p-[10px]">
              {isSectionTitle ? (
                <h2 className="font-semibold text-lg text-gray-800 m-0">
                  {getString(title)}
                </h2>
              ) : (
                <span className="font-normal">{getString(title)}</span>
              )}
              {showAsteriskChar && (
                <span className="text-red-500 text-error-main">*</span>
              )}
            </div>
          </div>
          {!isSectionTitle && (
            <div className={clsx('flex items-center colon')}>
              <span>:</span>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-flow-row grid-row-2 relative items-center w-1/2">
        <div
          className={clsx([
            showPenIcon && 'flex',
            renderBy === 'CustomAutocomplete' ? '!pl-0' : 'pl-3',
          ])}
        >
          {children}
        </div>
      </div>
      {showError && (
        <div className="pl-2.5 left-0 bottom-0 text-xs text-red-500">
          {error}
        </div>
      )}
      {subText && (
        <small
          className="w-full pl-2.5 pb-3 text-gray-500"
          data-testid="subText"
        >
          {subText}
        </small>
      )}
    </div>
  );
}
export default InputContainer;
