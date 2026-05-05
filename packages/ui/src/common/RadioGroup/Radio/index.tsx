import React from 'react';

interface RadioProps {
  id?: string;
  name: string;
  dataTestId?: string;
  value: number | string;
  selected?: boolean;
  disabled?: boolean;
  label?: string | React.ReactNode;
  radioType?: 'circle' | 'tick';
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: number | string
  ) => void;
}

function Radio({
  dataTestId,
  value,
  selected = false,
  disabled = false,
  onChange,
  label,
  name,
  id = name,
  radioType = 'circle',
}: RadioProps) {
  return (
    <div className="grid grid-cols-[auto,1fr] gap-2 items-center pb-2 pr-2">
      <div className="relative">
        <input
          type="radio"
          id={id}
          name={name}
          data-testid={dataTestId ?? `radio-${name}-${value}`}
          className="opacity-0 absolute m-0 p-0 w-4 h-4 z-20 peer cursor-pointer disabled:cursor-default"
          value={value}
          checked={selected}
          onChange={(e) => onChange(e, value)}
          disabled={disabled}
        />
        {radioType === 'circle' && (
          <span
            className="
            content-['']
            block
            relative
            top-0
            left-0
            w-4
            h-4
            min-w-4
            min-h-4
            rounded-full
            border-[2px]
            border-solid
            border-line
            bg-transparent
            hover:border-primary
            peer-disabled:hover:border-line
            peer-hover:border-primary
            peer-disabled:peer-hover:border-line
            peer-checked:border-primary
            peer-disabled:peer-checked:border-line
            peer-checked:after:content-['']
            peer-checked:after:rounded-full
            peer-checked:after:w-[10px]
            peer-checked:after:h-[10px]
            peer-checked:after:min-w-[10px]
            peer-checked:after:min-h-[10px]
            peer-checked:after:absolute
            peer-checked:after:top-[50%]
            peer-checked:after:left-[50%]
            peer-checked:after:translate-x-[-50%]
            peer-checked:after:translate-y-[-50%]
            peer-checked:after:block
            peer-checked:after:bg-primary
            peer-disabled:border-line
            peer-checked:peer-disabled:after:bg-line
            disabled:border-line
          "
          />
        )}
        {radioType === 'tick' && (
          <span
            className="
            content-['']
            block
            relative
            top-0
            left-0
            w-4
            h-4
            min-w-4
            min-h-4
            rounded-full
            border-[2px]
            border-solid
            border-line
            hover:border-primary
            peer-disabledhover:border-line
            peer-hover:border-primary
            peer-disabled:peer-hover:border-line
            peer-checked:border-primary
            peer-disabled:peer-checked:border-line
            peer-checked:bg-primary
            peer-disabled:peer-checked:bg-line
            peer-checked:after:content-['']
            peer-checked:after:w-[4px]
            peer-checked:after:h-[7px]
            peer-checked:after:min-w-[4px]
            peer-checked:after:min-h-[7px]
            peer-checked:after:absolute
            peer-checked:after:top-[65%]
            peer-checked:after:left-[50%]
            peer-checked:after:translate-x-[-50%]
            peer-checked:after:translate-y-[-85%]
            peer-checked:after:rotate-45
            peer-checked:after:border-solid
            peer-checked:after:border-t-0
            peer-checked:after:border-r-[2px]
            peer-checked:after:border-b-[2px]
            peer-checked:after:border-l-0
            peer-checked:after:border-white
            peer-disabled:peer-checked:after:bg-line
            peer-disabled:border-line
            disabled:border-line
          "
          />
        )}
      </div>
      {label && (
        <label htmlFor={name} className="capitalize peer-disabled:bg-[#9ca3af]">
          {label}
        </label>
      )}
    </div>
  );
}

export default Radio;
