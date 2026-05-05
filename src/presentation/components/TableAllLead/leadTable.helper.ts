import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { getSortQueryString } from 'utils/leadSearchUtils';

import { DEFAULT_PER_PAGE_TABLE, SORT_TABLE_TYPE } from './TableAllLead.helper';

export enum IS_CHECKED {
  NONE = 'NONE',
  SOME_ITEMS = 'SOME_ITEMS',
  ALL = 'ALL',
}

export interface TableRowData {
  [key: string]: string | number | boolean;
}

export const getInitialPageState = (
  tableType: TABLE_LEAD_TYPE,
  product?: string
) => {
  const initialPageState = {
    currentPage: 1,
    pageSize: DEFAULT_PER_PAGE_TABLE,
    orderBy: '',
  };
  switch (tableType) {
    case TABLE_LEAD_TYPE.LEAD_ALL:
      initialPageState.orderBy = getSortQueryString(
        'lead.createTime',
        SORT_TABLE_TYPE.DESC
      );
      break;
    case TABLE_LEAD_TYPE.LEAD_ASSIGNMENT:
      initialPageState.orderBy = getSortQueryString(
        'lead.name',
        SORT_TABLE_TYPE.ASC
      );
      break;
    case TABLE_LEAD_TYPE.LEAD_REJECTION:
      initialPageState.orderBy =
        product && product === 'products/health-insurance'
          ? ''
          : getSortQueryString(
              'attributes.undecidedRejectionCreateTime',
              SORT_TABLE_TYPE.ASC
            );
      break;
    default:
      break;
  }
  return initialPageState;
};

export const initialButtonState: {
  assign?: boolean;
  unassign?: boolean;
  approve?: boolean | null;
  ids?: string[];
  rejections?: string[];
  statuses?: { id: string; status: string }[];
}[] = [
  { assign: false, ids: [] },
  { unassign: false, ids: [] },
  { approve: null, rejections: [], statuses: [] },
];
