import { FormHelperText } from '@material-ui/core';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

function RadioGroupRow({ children, error }: PropsWithChildren<any>) {
  return (
    <div
      className={clsx('border-solid border-0  border-muted-light mb-2', {
        'border-l-2 border-red-400': Boolean(error),
        'border-b-[1px]': !error,
      })}
    >
      {children}
      {error && (
        <FormHelperText error className="pl-3">
          {error}
        </FormHelperText>
      )}
    </div>
  );
}

export default RadioGroupRow;
