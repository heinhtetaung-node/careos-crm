import { Grid as MuiGrid, makeStyles, withTheme } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import { useField } from 'formik';
import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

const Grid = withTheme(styled(MuiGrid)`
  &&& {
    padding: ${({ theme }) => theme.spacing(4)}px;
  }
`);

type ScreenSizes = 3 | 4 | 6 | 9 | 12;

interface InputProps {
  name: string;
  selectField?: string;
  label?: string;
  filterType?: string;
  min?: number;
  max?: number;
  multiple?: boolean;
  placeholder?: string;
  step?: number;
  type?: string;
  value?: any;
  options?: Array<any>;
  searchData?: {
    [key: string]: string;
  };
  limit?: number;
  onChange?: (e: any) => void;
  searchOption?: Array<any>;
  fixedLabel?: boolean;
  selectName?: string;
  marks?: boolean;
  async?: boolean;
  asyncFn?: any;
  lookup?: boolean;
  lookupFn?: any;
  labelField?: string;
  valueField?: string;
  isPlaceHolder?: boolean;
  isTeamPage?: boolean;
  children?: any;
  errorMessage?: string;
  isShow?: boolean;
  responsive?: {
    xs?: ScreenSizes;
    md?: ScreenSizes;
    lg?: ScreenSizes;
    xl?: ScreenSizes;
  };
  filterDataField?: string; // Passed as Key to the filter. example: role => filter=role%3D%22roles%2Fadmin%22
  filterDataValue?: string; // Passed as value to the filter. example: roles/admin => filter=role%3D%22roles%2Fadmin%22
  startWithValue?: any;
  hasExpand?: boolean;
  disableClearable?: boolean;
  hasSelectAll?: boolean;
  pageSize?: number;
  paginate?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: ClassNameMap<string>;
  testid?: string;
  onFocusFn?: any;
  apiDataField?: string;
  hasFormattedResponse?: boolean;
  adornment?: string;
  disabledDay?: (date: Date) => boolean;
  callback?: (entity: Record<PropertyKey, any>) => {
    title: string;
    value: string;
  };
  dependentValues?: string[];
  handleOnclickDateRange?: () => void;
  missingId?: boolean;
  searchFn?: (query: string) => Promise<unknown>;
  queryParams?: string;
  limitTags?: number;
}

export interface IFilterFormField {
  InputComponent?: any;
  inputProps: InputProps;
  childNodes?: IFilterFormField[];
  xs?: ScreenSizes;
  md?: ScreenSizes;
  lg?: ScreenSizes;
  xl?: ScreenSizes;
}

const useStyles = makeStyles({
  displayFilters: {
    display: 'none',
  },
});

function FilterField({
  inputProps = { name: '' },
  InputComponent,
  childNodes,
  xs = 6,
  md = 6,
  lg = 6,
  xl = 3,
  ...props
}: IFilterFormField) {
  const classes = useStyles();
  const { name, onChange, isShow, ...rest } = inputProps;
  const [field] = useField(name);
  const _handleChange = (e: ChangeEvent) => {
    field.onChange(e);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <Grid
      item
      xs={xs}
      md={md}
      lg={lg}
      xl={xl}
      {...props}
      className={isShow ? classes.displayFilters : ''}
    >
      <InputComponent
        {...field}
        {...rest}
        childNodes={childNodes}
        onChange={_handleChange}
        // eslint-disable-next-line react/forbid-component-props
        style={{ width: '100%' }}
      />
    </Grid>
  );
}

export default FilterField;
