import { StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';

import { ImportType } from 'shared/constants/importFile';

export interface IDictionary {
  [key: string]: any;
}

export interface IDictionaryWithType<T> {
  [key: string]: T;
}

export interface IRemoteConfig {
  endpoint?: string;
  gateway?: string;
  [key: string]: any;
}

export interface IBase64FileInfo {
  base64EncodedData: string;
  type: string;
  name: string;
}

export interface IDataList<T> {
  byId: {
    [key: string]: T;
  };
  ids: Array<string>;
}

export interface IActionParams {
  sectionId?: string;
  isAppend?: boolean;
  canLoadMore?: boolean;
  [key: string]: any;
}

export interface IAction<T> {
  type: string;
  payload?: T;
  error?: any;
  params?: IActionParams;

  [key: string]: any;
}

export interface IState<T> {
  isFetching: boolean;
  status?: string;
  data?: T;
  params?: any;
  errorMessage?: string;
  actionType?: string;
  success: boolean;
  canLoadMore?: boolean;
  tableType?: string;
}

export interface IStateForList<T> extends IState<IDataList<T>> {
  data?: IDataList<T>;
}

export interface SectionListData<T> {
  [key: string]: IDataList<T>;
}

export interface ISnackBarConfig {
  status: string;
  message: string;
  isOpen: boolean;
  isNotClose?: boolean;
}

export interface IFilterFormField {
  placeholder?: string;
  name: string;
  Tag?: any;
  label?: string;
  value?: any;
  options?: Array<any>;
  onChange?: any;
  selectName?: string;
  selectLabel?: string;
  selectField?: string;
  columnSizeXs?: 3 | 6 | 12;
  columnSizeMd?: 3 | 6 | 12;
  columnSizeLg?: 3 | 6 | 12;
  columnSizeXl?: 3 | 6 | 12;
  isTeamPage?: boolean;
  children?: any;
  min?: number;
  max?: number;
  step?: number;
  marks?: boolean;
  isPlaceHolder?: boolean;
  multiple?: boolean;
  onInputChange?: any;
  async?: boolean;
  asyncFn?: any;
  labelField?: string;
  valueField?: string;
  fixedLabel?: boolean;
  searchData?: any;
  searchOption?: any[];
  childNodes?: IFilterFormField[];
  filter?: {
    type:
      | 'input'
      | 'singleSelect'
      | 'multiselect'
      | 'slider'
      | 'search'
      | 'timePicker';
    queryParam: string;
  };
}

export type epicWithStateFn = (
  action$: Observable<any>,
  state: StateObservable<any>
) => Observable<any>;

export type epicWithDependencies = (
  action$: Observable<any>,
  state: StateObservable<any>,
  dependencies?: any
) => Observable<any>;

export type epicWithoutStateFn = (action$: Observable<any>) => Observable<any>;

export type executeWithPayloadFn<T = any, U = any> = (
  payload: T,
  ...args: any[]
) => Observable<U>;

export type executeWithoutPayloadFn<T = any> = () => Observable<T>;

export interface IReduxState {
  payload?: any;
  error?: any;
  isFetching: boolean;
  success: boolean;
  data?: any;
}

export interface ISelectValue {
  id: number;
  value: string;
  title: string;
}

export interface IImportData {
  product: string;
  file: any;
  importType: ImportType;
  leadDetails?: {
    source: string;
  };
  packageDetails?: {
    packageType: string;
  };
  filename: string;
}

export interface OrderParams {
  orderId: string;
  policyId?: string;
}

type OrderId = {
  id?: string;
};

export interface AssignmentPayload {
  agentFullName: string;
  listCheckBox?: OrderId[];
}
