import { FormControl, MenuItem, Select } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { useField, useFormikContext } from 'formik';
import i18next from 'i18next';
import _getValue from 'lodash/get';
import * as React from 'react';
import { Subscription } from 'rxjs';

import LeadDetail from 'data/repository/leadDetail/cloud';
import { IFormikSelectFieldProps } from 'interfaces/FormikFieldsInterface';
import { getString } from 'presentation/theme/localization';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

import InputContainer from '../../InputContainer';

interface SelectElement {
  value: any;
  name?: string | undefined;
  handleUpdate?: (payload: any) => void;
}

function FormikSubdistrictSelector({
  name,
  title,
  dataTestId,
  placeholder = getString('package.selectPlaceholder'),
  handleUpdate,
  ...rest
}: IFormikSelectFieldProps) {
  const [options, setOptions] = React.useState([]);
  const lang = capitalizeFirstLetter(i18next.language);
  const [field, meta, helpers] = useField(name);
  const { setFieldValue, values }: { setFieldValue: any; values: any } =
    useFormikContext();
  const province = _getValue(values, 'province');
  const subDistricts = _getValue(values, 'subDistricts');
  const district = _getValue(values, 'district');
  const { setValue } = helpers;
  const { error } = meta;
  const { value } = field;
  let subdistrictSub: Subscription;

  const handleChange = (event: React.ChangeEvent<SelectElement>) => {
    const subDistrictValue = event.target.value;
    const selected = subDistricts.find(
      (item: any) =>
        item.name.replace(
          `provinces/${province}/districts/${district}/subdistricts/`,
          ''
        ) === `${subDistrictValue}`
    );
    if (selected) {
      setFieldValue('postcode', selected.postcode);
    }
    setValue(subDistrictValue);
    setFieldValue('subDistrict', subDistrictValue);
    if (handleUpdate) {
      handleUpdate({
        [name]: subDistrictValue,
        postcode: selected?.postcode ?? values?.postcode,
      });
    }
  };

  const getDistricts = () => {
    const path =
      province && district ? `provinces/${province}/districts/${district}` : '';
    if (path) {
      subdistrictSub = LeadDetail.getSubDistrict(path).subscribe((res: any) => {
        setOptions(res);
      });
    }
  };

  React.useEffect(() => {
    if (subDistricts.length) {
      setOptions(subDistricts);
    }
  }, [subDistricts]);

  React.useEffect(() => {
    if (province && district) {
      getDistricts();
    }
    return () => {
      if (subdistrictSub) {
        subdistrictSub.unsubscribe();
      }
    };
  }, []);

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

          {options?.length
            ? options.map((subDistrict: any) => (
                <MenuItem
                  key={subDistrict.name}
                  value={Number(
                    subDistrict.name.replace(
                      `provinces/${province}/districts/${district}/subdistricts/`,
                      ''
                    )
                  )}
                >
                  {subDistrict[`name${lang}`]}
                </MenuItem>
              ))
            : null}
        </Select>
      </FormControl>
    </InputContainer>
  );
}

export default FormikSubdistrictSelector;
