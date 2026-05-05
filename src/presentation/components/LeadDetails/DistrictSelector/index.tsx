import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';

import LeadDetail from 'data/repository/leadDetail/cloud';
import Controls from 'presentation/components/controls/Control';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

function DistrictSelector({
  id,
  label,
  provinceId,
  placeholder = '',
  value,
  setFieldValue,
  keyForm,
  name,
  ...rest
}: any) {
  const [options, setOptions] = useState([]);
  const [defaultValue, setDefaultValue] = useState({});
  const lang = capitalizeFirstLetter(i18next.language);

  useEffect(() => {
    const getDistricts = () => {
      if (!provinceId) return;
      LeadDetail.getDistrict(provinceId).subscribe((res: any) => {
        setOptions(res);
      });
    };

    getDistricts();
  }, [provinceId]);

  useEffect(() => {
    const currentDistrict = options.find((option: any) => {
      return Number(option.name.split('/')[3]) === value;
    });

    if (currentDistrict) {
      setDefaultValue(currentDistrict);
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
        label={label}
        options={options}
        value={defaultValue}
        fixedLabel
        multiple={false}
        labelField={`name${lang}`}
        disableClearable
        async
        asyncFn={() => LeadDetail.getDistrict(provinceId)}
        onChange={(e) => {
          const districtID = Number(
            e.target.value.name.replace(`${provinceId}/districts/`, '')
          );
          setFieldValue(e.target.name, districtID);
          setFieldValue(`${keyForm}.subDistrict`, '');
          setFieldValue(`${keyForm}.postCode`, '');
        }}
        testid={name}
        {...rest}
      />
    </FormControl>
  );
}

export default DistrictSelector;
