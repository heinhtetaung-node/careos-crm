import { CircularProgress } from '@material-ui/core';
import React from 'react';

interface LinkFieldInterface {
  title: string;
  link: string | undefined;
  value: string | undefined;
  isDisabled?: boolean;
  isLoading?: boolean;
}

function LinkField({
  title,
  link,
  value,
  isDisabled = false,
  isLoading = false,
}: LinkFieldInterface) {
  return (
    <span className="flex py-[10px] px-[15px]">
      <span className="w-1/2">{title}</span>
      <span>:</span>
      {isLoading ? (
        <span className="w-1/2 flex justify-center">
          <CircularProgress size={24} />
        </span>
      ) : (
        <span className="w-1/2 pl-2">
          {isDisabled || !link ? (
            (value ?? '-')
          ) : (
            <a href={link} target="_blank" rel="noreferrer">
              {value ?? '-'}
            </a>
          )}
        </span>
      )}
    </span>
  );
}

export default LinkField;
