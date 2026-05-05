import clsx from 'clsx';
import React from 'react';

interface FieldRowProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

function FieldRow({ label, value, className }: FieldRowProps) {
  return (
    <div
      className={clsx(
        'relative flex flex-wrap w-full border-solid border-t-0 border-l-0 border-r-0 border-b-gray-200 border-b-[1px]',
        className
      )}
    >
      <div className="flex w-1/2 justify-between">
        <div className="flex items-center">
          <div className="p-[10px]">
            <span className="font-normal text-gray-800">{label}</span>
          </div>
        </div>
        <div className="flex items-center colon">
          <span>:</span>
        </div>
      </div>

      <div className="grid grid-flow-row relative items-center w-1/2">
        <div className="pl-3">
          <span className="font-normal text-gray-800">{value || '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default FieldRow;
