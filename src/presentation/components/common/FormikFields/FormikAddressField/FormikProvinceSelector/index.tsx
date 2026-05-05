/* eslint-disable react-hooks/exhaustive-deps */
import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { useField, useFormikContext } from 'formik';
import i18next from 'i18next';
import * as React from 'react';
import { Subscription } from 'rxjs';

import LeadDetail from 'data/repository/leadDetail/cloud';
import { IFormikSelectFieldProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

import InputContainer from '../../InputContainer';

interface SelectElement {
  value: any;
  name?: string;
}

function FormikProvinceSelector({
  name,
  title,
  dataTestId,
  placeholder = getString('package.selectPlaceholder'),
  ...rest
}: IFormikSelectFieldProps) {
  const lang = capitalizeFirstLetter(i18next.language);
  const [options, setOptions] = React.useState([]);
  const [dependentOptions, setDependentOptions] = React.useState([]);
  const [field, meta, helpers] = useField(name);
  const { setFieldValue, setFieldError } = useFormikContext();
  const { setValue } = helpers;
  const { error } = meta;
  const { value } = field;
  let provinceSub: Subscription;
  let districtSub: Subscription;

  const getProvinces = () => {
    provinceSub = LeadDetail.getProvince().subscribe(
      (res: any) => {
        setOptions(res);
      },
      (err: any) => {
        setFieldError('province', err.toString());
      }
    );
  };

  const getDistricts = (province: string) => {
    districtSub = LeadDetail.getDistrict(`provinces/${province}`).subscribe(
      (res: any) => {
        setDependentOptions(res);
      },
      (err: any) => {
        setFieldError('district', err.toString());
      }
    );
  };

  React.useEffect(() => {
    getProvinces();
    return () => {
      if (provinceSub) {
        provinceSub.unsubscribe();
      }
      if (districtSub) {
        districtSub.unsubscribe();
      }
    };
  }, []);

  React.useEffect(() => {
    if (dependentOptions.length) {
      setFieldValue('districts', dependentOptions);
    }
  }, [dependentOptions]);

  const handleChange = (event: React.ChangeEvent<SelectElement>) => {
    const val = event.target.value;
    setValue(val);
    getDistricts(val);
    setFieldValue('province', val);
    setFieldValue('district', '');
    setFieldValue('subDistrict', '');
    setFieldValue('subDistricts', '');
    setFieldValue('postcode', '');
  };

  return (
    <InputContainer
      title={title}
      showAsterisk={!!error}
      error={error}
      dataTestId={dataTestId}
      isReadOnly={false}
    >
      <FormControl fullWidth>
        <Select
          {...rest}
          error={Boolean(error)}
          value={options?.length ? value : ''}
          onChange={handleChange}
          IconComponent={ExpandMoreRoundedIcon}
          disableUnderline
          MenuProps={{
            getContentAnchorEl: null,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
          }}
          inputProps={{
            'data-testid': `${dataTestId}-select`,
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>

          {options?.length &&
            options.map((province: any) => {
              return (
                <MenuItem
                  key={province.name}
                  value={Number(province.name.replace('provinces/', ''))}
                >
                  {province[`name${lang}`]}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </InputContainer>
  );
}

export default FormikProvinceSelector;
