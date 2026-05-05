import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';

import LeadDetail from 'data/repository/leadDetail/cloud';
import Controls from 'presentation/components/controls/Control';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

interface IOption {
  name: string;
  value: string;
  postcode: number;
}

function SubDistrictSelector({
  id,
  label,
  districtId,
  placeholder = '',
  value,
  onChange,
  name,
  ...rest
}: any) {
  const [options, setOptions] = useState<IOption[]>([]);
  const [defaultValue, setDefaultValue] = useState({});
  const lang = capitalizeFirstLetter(i18next.language);

  useEffect(() => {
    const getSubDistrict = () => {
      if (!districtId) return;
      LeadDetail.getSubDistrict(districtId).subscribe((res: any) => {
        setOptions(res);
      });
    };

    getSubDistrict();
  }, [districtId]);

  useEffect(() => {
    const currentSubDistrict = options.find((option: any) => {
      return Number(option.name.split('/')[5]) === value;
    });

    if (currentSubDistrict) {
      setDefaultValue(currentSubDistrict);
    } else {
      setDefaultValue({});
    }
  }, [options, value]);

  return (
    <FormControl>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <Controls.Autocomplete
        name={name}
        options={options}
        value={defaultValue}
        label={label}
        labelField={`name${lang}`}
        multiple={false}
        fixedLabel
        disableClearable
        async
        asyncFn={() => LeadDetail.getSubDistrict(districtId)}
        onChange={(e) => {
          onChange(e, e.target.value.postcode);
        }}
        testid={name}
        {...rest}
      />
    </FormControl>
  );
}

export default SubDistrictSelector;
