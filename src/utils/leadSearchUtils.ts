import { add, format } from 'date-fns';
import _isUndefined from 'lodash/isUndefined';
import _omitBy from 'lodash/omitBy';

import { filterMap } from 'data/gateway/api/resource/lead';
import {
  buildFilter,
  hasLeadStatusFilter,
} from 'data/gateway/api/resource/leadSearch';
import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import {
  formatE164,
  isPossiblePhoneNumber,
  SORT_TABLE_TYPE,
} from 'shared/helper/utilities';

export interface PageState {
  currentPage: number;
  pageSize: number;
  orderBy: string;
}

export const getSortQueryString = (
  fieldName: string,
  sort: SORT_TABLE_TYPE
) => {
  switch (sort) {
    case SORT_TABLE_TYPE.ASC:
      return `${fieldName}`;
    case SORT_TABLE_TYPE.DESC:
      return `${fieldName} desc`;
    case SORT_TABLE_TYPE.NONE:
    default:
      return '';
  }
};

export const transformPageStateToQuery = (pageState: PageState) => {
  const start = (pageState.currentPage - 1) * pageState.pageSize;
  return _omitBy(
    {
      page_from: start !== 0 ? start : undefined,
      page_size: pageState.pageSize,
      order_by: pageState.orderBy,
    },
    _isUndefined
  ) as {
    page_from?: number;
    page_size: number;
    order_by: string;
  };
};

export const getLeadSearchFilterQueryString = ({
  tableType,
  filters,
  policyDateEnabled,
}: {
  tableType: TABLE_LEAD_TYPE;
  filters: any;
  policyDateEnabled: boolean;
}) => {
  const filterStrings = [
    ...buildFilter(
      {
        ...filters,
        date: {
          ...filters.date?.startDate,
        },
        date2: {
          ...filters.date?.endDate,
        },
        search: {
          [filters.search?.key]:
            filters.search?.key === 'customerPhone' &&
            isPossiblePhoneNumber(filters.search?.value)
              ? formatE164(filters.search?.value)
              : filters.search?.value,
        },
      },
      filterMap(),
      [],
      false
    ),
  ];

  const unAssignedFilter = filterStrings.find(
    (str) => str.includes('assigned.name') && str.includes('""')
  );
  if (unAssignedFilter) {
    filterStrings.splice(filterStrings.indexOf(unAssignedFilter), 1);
    filterStrings.push('assigned not_exists');
  }

  if (
    tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT &&
    ((filterStrings && !hasLeadStatusFilter(filterStrings)) ||
      filterStrings.length === 0)
  ) {
    filterStrings.push('lead.status!="LEAD_STATUS_PURCHASED"');
  }

  if (tableType === TABLE_LEAD_TYPE.LEAD_REJECTION) {
    filterStrings.push(
      'lead.isRejected=false rejections.decideTime="0001-01-01T00:00:00Z"'
    );
  }

  if (
    policyDateEnabled &&
    (tableType === TABLE_LEAD_TYPE.LEAD_ALL ||
      tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT)
  ) {
    filterStrings.push(
      `insurance.policyExpiryDate<="${format(
        add(new Date(), { days: 90 }),
        'yyyy-MM-dd'
      )}" insurance.policyExpiryDate>="0001-01-01T00:00:00Z"`
    );
  }

  if (
    tableType === TABLE_LEAD_TYPE.LEAD_MYLEAD ||
    tableType === TABLE_LEAD_TYPE.LEAD_ASSIGNMENT
  ) {
    filterStrings.push('lead.isRejected!=true');
  }
  return filterStrings.join(' ');
};
