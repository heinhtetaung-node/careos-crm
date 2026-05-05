export const COLLAPSED_ROWS_LG = 1;
export const COLLAPSED_ROWS_MD = 2;
export const COLLAPSED_ROWS_SM = 3;
export const FIXED_LABEL = true;

export interface formDefaultData<T> {
  date: {
    criteria: string;
    range: any;
  };
  date2: {
    criteria: string;
    range: any;
  };
  search: {
    key: string;
    value: string;
  };
  remark: Array<T>;
  leadStatus: Array<T>;
  createBy: string;
  sumInsured: Array<T>;
}

export const INITIAL_VALUES = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  leadStatus: [],
  createBy: '',
  sumInsured: [0, 0],
};
