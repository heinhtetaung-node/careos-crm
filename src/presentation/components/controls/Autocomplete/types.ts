import { AutocompleteProps } from '@material-ui/lab/Autocomplete';
import { ChangeEvent } from 'react';
import { Observable } from 'rxjs';

import ResponseModel from 'models/response';

type MULTIPLE = boolean;
type DISABLE_CLEARABLE = boolean;
type FREESOLO = boolean;

/**
 * This is a set of options that will be passed as query parameters
 * to the async function. If the parameter's aren't supported they will
 * not be used.
 */
export interface AsyncOptions {
  filter?: string;
  orderBy?: string;
  pageSize?: number;
  pageToken?: string;
}

export interface MyAutoCompleteProps
  extends Omit<
    AutocompleteProps<any, MULTIPLE, DISABLE_CLEARABLE, FREESOLO>,
    'renderInput' | 'onChange'
  > {
  label?: string;
  popper?: string;
  placeholder?: string;
  limitTags?: number;
  onChange?: (event: ChangeEvent<any>, value: unknown, reason: string) => void;
  disabledOptions?: boolean;
  fixedLabel?: boolean;
  marginRight?: number;
  variant?: string;
  name: string;
  value?: any;
  async?: boolean;
  asyncFn?: (props: AsyncOptions) => Observable<ResponseModel<any>>;
  lookup?: boolean;
  lookupFn?: () => Observable<ResponseModel<any>>;
  labelField?: string;
  valueField?: string;
  filterDataField?: string;
  filterDataValue?: string;
  startWithValue?: { [key: string]: string };
  hasSelectAll?: boolean;
  paginate?: boolean;
  // Only used if paginate is true.
  pageSize?: number;
  disabled?: boolean;
  testid?: string;
  onFocusFn?: () => Promise<any>;
  hasFormattedResponse?: boolean;
  isEditable?: boolean;
  firstOption?: any;
  apiDataField?: string;
  missingId?: boolean;
  idField?: string;
  searchFn?: (
    query: string
  ) => Promise<{ fullName: string; id: string; value: string }[]>;
}
