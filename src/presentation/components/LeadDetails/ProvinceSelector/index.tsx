import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';

import LeadDetail from 'data/repository/leadDetail/cloud';
import Controls from 'presentation/components/controls/Control';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

function ProvinceSelector({
  id,
  label,
  placeholder = '',
  value,
  setFieldValue,
  keyForm,
  name,
  ...rest
}: any) {
  const [options, setOptions] = useState([]);
  const [defaultValue, setDefaultValue] = useState(null);
  const lang = capitalizeFirstLetter(i18next.language);

  const getProvinces = () => {
    LeadDetail.getProvince().subscribe((res: any) => {
      setOptions(res);
    });
  };

  useEffect(() => {
    getProvinces();
  }, []);

  useEffect(() => {
    const currentProvince = options?.find((option: any) => {
      return Number(option.name.split('/')[1]) === value;
    });

    if (currentProvince) {
      setDefaultValue(currentProvince);
    } else {
      setDefaultValue(null);
    }
  }, [options, value]);

  return (
    <FormControl>
      <InputLabel id={`${id}-label`} shrink>
        {label}
      </InputLabel>
      <Controls.Autocomplete
        name={name}
        label={label}
        options={options}
        labelField={`name${lang}`}
        onChange={(e) => {
          const provinceID = Number(
            e.target.value.name.replace('provinces/', '')
          );
          setFieldValue(e.target.name, provinceID);
          setFieldValue(`${keyForm}.district`, '');
          setFieldValue(`${keyForm}.subDistrict`, '');
          setFieldValue(`${keyForm}.postCode`, '');
        }}
        value={defaultValue}
        fixedLabel
        multiple={false}
        disableClearable
        async
        asyncFn={LeadDetail.getProvince}
        testid={name}
        {...rest}
      />
    </FormControl>
  );
}

export default ProvinceSelector;
