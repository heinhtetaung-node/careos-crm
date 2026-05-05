import { withStyles, Box } from '@material-ui/core';
import { useUpdateEffect } from 'ahooks';
import React, { useState, useEffect } from 'react';

import AutoComplete from 'presentation/components/controls/Autocomplete/Autocomplete';
import { vehicleColorOptions } from 'presentation/components/VehiclePolicySection/helper';
import { Colon } from './index.style';

interface RenderInputAutoCompleteProps {
  handleOnUpdate: (payload: any) => void;
  name: string;
  allowMaxTags: number;
  value?: any[];
  isEditable?: boolean;
  setShowHighlight?: (status: boolean) => void;
}

const FieldAutoCompleteItem = withStyles({
  root: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    '& .MuiAutocomplete-inputRoot': {
      '& .MuiInputBase-input': {
        border: 0,
      },
      '& input:not([readOnly]):focus, & input:not([readOnly]):hover, & input:not([readOnly])':
        {
          border: 0,
        },
    },
  },
})(Box);

export default function RenderInputAutoComplete({
  handleOnUpdate,
  name,
  allowMaxTags,
  value,
  isEditable = true,
  setShowHighlight = () => null,
}: RenderInputAutoCompleteProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    typeof vehicleColorOptions
  >([]);

  const handleUpdate = () => {
    const payload = {
      name,
      value: selectedOptions.map((option) => option.value),
    };
    handleOnUpdate(payload);
  };

  const disabledOptions =
    !(allowMaxTags < 0) && selectedOptions.length >= allowMaxTags;

  useUpdateEffect(() => {
    const shouldUpdate =
      selectedOptions.length > 0 && selectedOptions.length !== value?.length;
    if (shouldUpdate) {
      handleUpdate();
    }
  }, [selectedOptions]);

  useEffect(() => {
    if (selectedOptions.length) {
      setShowHighlight(false);
      return;
    }
    setShowHighlight(true);
  }, [selectedOptions, setShowHighlight]);

  useEffect(() => {
    setSelectedOptions(
      vehicleColorOptions.filter((c) => value?.includes(c.value))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.length]);

  return (
    <FieldAutoCompleteItem>
      <Colon>: </Colon>
      <AutoComplete
        name="vehicleColor"
        value={selectedOptions}
        disabledOptions={disabledOptions}
        onChange={(_, value, reason) => {
          if (disabledOptions && reason === 'select-option') return;
          setSelectedOptions(value as typeof vehicleColorOptions);
          if ((value as any).length === 0 && reason === 'remove-option')
            handleOnUpdate({ name, value: [] });
        }}
        options={vehicleColorOptions}
        limitTags={3}
        isEditable={isEditable}
      />
    </FieldAutoCompleteItem>
  );
}
