import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import React, { useState } from 'react';

interface IOption {
  name: string;
  nameEn: string;
  nameTh: string;
  postcode: number;
}

const options: IOption[] = [
  {
    name: 'provinces/100000/districts/100200/subdistricts/100201',
    nameEn: 'Dusit',
    nameTh: 'ดุสิต',
    postcode: 10300,
  },
  {
    name: 'provinces/100000/districts/100200/subdistricts/100211',
    nameEn: 'Dusit 1',
    nameTh: 'ดุสิต',
    postcode: 10301,
  },
];

function SubDistrictSelector({ id, label, onChange, name }: any) {
  const [value, setValue] = useState<string | undefined>('');

  return (
    <FormControl>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <input
        name={name}
        value={value}
        onChange={(e) => {
          const currentSubDistrict = options.find(
            (option: IOption) => option.name === e.target.value
          );

          onChange(
            {
              target: {
                value: currentSubDistrict,
              },
            },
            currentSubDistrict
          );
          setValue(e.target.value);
        }}
        data-testid={name}
      />
    </FormControl>
  );
}

export default SubDistrictSelector;
