import { getString } from 'presentation/theme/localization';
import React, { useEffect, useState } from 'react';
import { SelectElement } from 'shared/types/controls';

import { isCharContain } from './helper';
import { Colon, FieldItem } from './index.style';

import Controls from 'presentation/components/controls/Control';
import { OptionProps } from 'presentation/components/controls/Select';
import { getGender, isGender } from '../leadDetailsPage.helper';

interface Props {
  initialValue: any;
  name: string | undefined;
  handleUpdateOrder: CallableFunction;
  className?: string;
  placeholder?: string;
  options: OptionProps[];
  isDisabled?: boolean;
  isEditable?: boolean;
  isFieldsDisabled?: boolean;
  setShowHighlight?: (status: boolean) => void;
  testId?: string;
}

function RenderInputSelectItem({
  initialValue,
  name,
  handleUpdateOrder,
  className = '',
  placeholder = getString(`text.select`),
  options,
  isFieldsDisabled = false,
  isDisabled = false,
  isEditable = true,
  setShowHighlight = () => null,
  testId = '',
}: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isCharContain(value)) {
      setShowHighlight(true);
      return;
    }
    setShowHighlight(false);
  }, [value, setShowHighlight]);
  const handleChange = (event: React.ChangeEvent<SelectElement>) => {
    if (!isDisabled) {
      setValue(event.target.value);
      if (!isCharContain(String(event.target.value))) return;
      handleUpdateOrder({
        name,
        value: event.target.value,
      });
    }
  };

  if (isFieldsDisabled) {
    return <span>: {isGender(value) ? getGender(value) : value}</span>;
  }

  return (
    <FieldItem data-testid={testId}>
      <Colon>: </Colon>
      <Controls.Select
        readOnly={!isEditable}
        options={options}
        selectField="name"
        title="displayName"
        name={name}
        value={value}
        onChange={!isDisabled ? handleChange : undefined}
        className={className}
        placeholder={placeholder}
      />
    </FieldItem>
  );
}

export default RenderInputSelectItem;
