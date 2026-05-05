import { Grid, Checkbox, FormControlLabel } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import './index.scss';

interface IOptions {
  id: number;
  label: string;
  value: string;
}

interface IProps {
  value: any[];
  items: IOptions[];
  onChange: (e: any) => void;
  name: string;
}

export default function ButtonMultiSelect({
  items,
  onChange,
  value,
  name,
}: IProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: any) => {
    const { value: newVal, checked } = event.target;
    const selectedValue: any[] = checked
      ? [...value, newVal]
      : value.filter((item: any) => item !== newVal);
    onChange({ ...event, target: { name, value: selectedValue } });
  };

  const isChecked = (currentValue: string) => {
    return selected.includes(currentValue);
  };

  const renderControl = (item: any) => {
    return (
      <Checkbox
        checked={isChecked(item.value)}
        value={item.value}
        name={item.label}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    );
  };

  useMemo(() => {
    setSelected(value);
  }, [value]);

  return (
    <>
      {items.map((item: any) => (
        <Grid key={item.id} item xs>
          <FormControlLabel
            label={item.label}
            key={item.id}
            className={clsx(
              isChecked(item.value) ? 'active' : '',
              'multiselect-form-label'
            )}
            control={renderControl(item)}
          />
        </Grid>
      ))}
    </>
  );
}
