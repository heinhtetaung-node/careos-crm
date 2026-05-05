import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import {
  MAX_ALLOWED_INPUT_FIELDS,
  InputAsPerType,
  initialValues,
  MultiInputFieldWithTypeProps,
  InputActionButtons,
} from './helper';

import Select from '../Select';

function MultiInputFieldWithType({
  label,
  name,
  options,
  fixedLabel = false,
  style,
  className = '',
  dataTestid,
  //   Input Props
  adornment,
  limit = MAX_ALLOWED_INPUT_FIELDS, // limit of inputs
  generic = false,
  onChange,
  value,
  ...rest
}: MultiInputFieldWithTypeProps) {
  const [noOfInputs, setNoOfInputs] = useState(value);

  // to reset the state
  useEffect(() => {
    if (!value.length) {
      setNoOfInputs(value);
    }
  }, [value]);

  useEffect(() => {
    if (!noOfInputs.length && options.length) {
      setNoOfInputs([
        {
          ...initialValues,
          id: options[0].id as string,
        },
      ]);
    }
  }, [noOfInputs.length, options]);

  const handleAddInputs = useCallback(() => {
    setNoOfInputs((prev) => {
      const updatedInputs = [...prev, { ...initialValues, key: prev.length }];
      if (updatedInputs.length > limit) {
        return prev;
      }
      return updatedInputs;
    });
  }, [limit]);

  const handleChangeInValues = useCallback(
    (e: any, id: number, type: 'id' | 'value') => {
      const allInputs = Array.from(noOfInputs);
      const currentInput: any = allInputs.find((data) => data.key === id);

      if (!currentInput) {
        return;
      }
      currentInput[type] = e.target.value;
      setNoOfInputs(allInputs);
    },
    [noOfInputs]
  );
  const handleRemoveInputs = useCallback(
    (id: number) =>
      setNoOfInputs((prev) => prev.filter((arr) => arr.key !== id)),
    []
  );

  useEffect(() => {
    onChange('search', noOfInputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noOfInputs]);

  return (
    <div
      className="container min-w-[450px]"
      data-testid="multiIinput-field-container"
    >
      {noOfInputs.map((_, index) => {
        const currentInput = options.find((arr) => arr.name === _.id);
        const shouldShowAddBtn =
          noOfInputs.length < limit && index === noOfInputs.length - 1;

        return (
          <div
            className="flex flex-start items-center w-full"
            key={`selectors-${_.id}-${index + 1}`}
          >
            <Select
              label={label}
              name={name}
              options={options}
              placeholder={getString('text.select')}
              selectField="name"
              value={_.id}
              fixedLabel={fixedLabel}
              onChange={(e) => handleChangeInValues(e, index, 'id')}
              className="max-w-[150px]"
              data-testid="select-input-type"
            />
            <InputAsPerType
              {...{
                name,
                type: currentInput?.type ?? 'text',
                label: currentInput?.title,
                title: currentInput?.title,
                style,
                className: clsx('mt-3 w-full max-w-[250px]', ...className),
                dataTestId: dataTestid,
                adornment,
                value: value[index]?.value ?? '',
                generic,
                placeholder:
                  currentInput?.placeholder ??
                  getString('text.enterPlaceholder'),
                onChange: (e: any) => handleChangeInValues(e, index, 'value'),
                ...rest,
              }}
            />
            <InputActionButtons
              {...{
                index,
                inputs: noOfInputs,
                shouldShowAddBtn,
                handleAddInputs,
                handleRemoveInputs,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default MultiInputFieldWithType;
