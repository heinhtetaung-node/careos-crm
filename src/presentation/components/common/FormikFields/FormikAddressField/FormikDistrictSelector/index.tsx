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
  name?: string;
}

type PlaceList = Record<string, any>[] | [] | undefined;

function FormikDistrictSelector({
  name,
  title,
  dataTestId,
  placeholder = getString('package.selectPlaceholder'),
  ...rest
}: IFormikSelectFieldProps) {
  const [options, setOptions] = React.useState<PlaceList>([]);
  const [dependentOptions, setDependentOptions] = React.useState([]);
  const lang = capitalizeFirstLetter(i18next.language);
  const [field, meta, helpers] = useField(name);
  const { setFieldValue, setFieldError, values } = useFormikContext();
  const province: PlaceList = _getValue(values, 'province', []);
  const districts: PlaceList = _getValue(values, 'districts', []);
  const { setValue } = helpers;
  const { error } = meta;
  const { value } = field;
  let subdistrictSub: Subscription;
  let districtSub: Subscription;

  const getSubDistricts = (districtId: string) => {
    const path =
      province && districtId
        ? `provinces/${province}/districts/${districtId}`
        : '';

    subdistrictSub = LeadDetail.getSubDistrict(path).subscribe(
      (res: any) => {
        setDependentOptions(res);
      },
      (err: any) => {
        setFieldError('subDistrict', err.toString());
      }
    );
  };

  const handleChange = (event: React.ChangeEvent<SelectElement>) => {
    const val = event.target.value;
    setValue(val);
    getSubDistricts(val);
    setFieldValue('district', val);
    setFieldValue('subDistrict', '');
    setFieldValue('postcode', '');
  };

  const getDistricts = () => {
    if (!province) return;
    districtSub = LeadDetail.getDistrict(`provinces/${province}`).subscribe(
      (res: any) => {
        setOptions(res);
      }
    );
  };

  React.useEffect(() => {
    if (dependentOptions.length) {
      setFieldValue('subDistricts', dependentOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependentOptions]);

  React.useEffect(() => {
    if (districts && districts?.length) {
      setOptions(districts);
    }
  }, [districts]);

  React.useEffect(() => {
    getDistricts();
    return () => {
      if (subdistrictSub) {
        subdistrictSub.unsubscribe();
      }
      if (districtSub) {
        districtSub.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

          {options?.length
            ? options.map((district: any) => {
                return (
                  <MenuItem
                    key={district.name}
                    value={Number(
                      district.name.replace(
                        `provinces/${province}/districts/`,
                        ''
                      )
                    )}
                  >
                    {district[`name${lang}`]}
                  </MenuItem>
                );
              })
            : null}
        </Select>
      </FormControl>
    </InputContainer>
  );
}

export default FormikDistrictSelector;
