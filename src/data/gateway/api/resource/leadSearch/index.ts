import { get } from 'lodash';

import { addDays, format } from 'utils/datetime';

type FilterValueDateType = {
  criteria: string;
  range: {
    startDate: Date;
    endDate: Date;
  };
};

export type FilterMapType = {
  filter: string;
  type: string;
  field?: string;
  options?: any[];
  callback?: any;
};

export enum PhoneCountryCode {
  thai = '66',
}

// Helper to encode value if needed
const maybeEncode = (value: any, shouldEncode: boolean) =>
  shouldEncode ? encodeURIComponent(value) : value;

function handleContain(filter: any, filterValue: any, encode: boolean) {
  if (!filterValue) return [];
  const value = maybeEncode(filterValue, filter.escape && encode);
  return [`${filter.field}:"${value}"`];
}

function handleMatch(filter: any, filterValue: any, encode: boolean) {
  if (
    !filter ||
    filterValue === '' ||
    filterValue === 'all' ||
    filterValue === null
  )
    return [];
  const valueToUse =
    filterValue && typeof filterValue === 'object' && filter.callback
      ? filter.callback(filterValue)
      : null;
  const value =
    filter?.isPhone && filterValue.charAt(0) === '0'
      ? PhoneCountryCode.thai + filterValue.substring(1)
      : filterValue;
  const newValue = valueToUse ?? value;
  const encodedValue = maybeEncode(newValue, filter.escape && encode);
  const valueStr =
    typeof encodedValue === 'string' ? `"${encodedValue}"` : encodedValue;
  return [`${filter.field}=${valueStr}`];
}

function handleChoiceDate(filter: any, filterValue: any) {
  if (!filter.options) return [];
  const filters: string[] = [];
  filter.options.forEach((option: any) => {
    // Main criteria
    if (option.filter === filterValue?.criteria) {
      if (filterValue.range.startDate) {
        filters.push(
          `${option.field}>="${filterValue.range.startDate.toISOString()}"`
        );
      }
      if (filterValue.range.endDate) {
        filters.push(
          `${option.field}<="${filterValue.range.endDate.toISOString()}"`
        );
      }
    }
    // Start date criteria
    if (option.filter === filterValue?.startDate?.criteria) {
      if (filterValue?.startDate?.range.startDate) {
        filters.push(
          `${option.field}>="${filterValue.startDate.range.startDate.toISOString()}"`
        );
      }
      if (filterValue?.startDate?.range.endDate) {
        filters.push(
          `${option.field}<="${filterValue.startDate.range.endDate.toISOString()}"`
        );
      }
    }
    // End date criteria
    if (option.filter === filterValue?.endDate?.criteria) {
      if (filterValue?.endDate?.range.startDate) {
        filters.push(
          `${option.field}>="${filterValue.endDate.range.startDate.toISOString()}"`
        );
      }
      if (filterValue?.endDate?.range.endDate) {
        filters.push(
          `${option.field}<="${filterValue.endDate.range.endDate.toISOString()}"`
        );
      }
    }
  });
  return filters;
}

function handleMulti(filter: any, filterValue: any) {
  if (!Array.isArray(filterValue) || !filterValue.length) return [];
  const items = filterValue.map((item: any) =>
    filter.callback ? filter.callback(item) : item
  );
  return [`${filter.field} in ("${items.join('","')}")`];
}

function handleRange(filter: any, filterValue: any, body: any) {
  if (!body[filter.filter] || filterValue[1] === 0) return [];
  return [
    `${filter.field}>=${filterValue[0]}`,
    `${filter.field}<=${filterValue[1]}`,
  ];
}

function handleExact(filter: any, filterValue: any) {
  if (
    !filter ||
    filterValue === '' ||
    filterValue === 'all' ||
    filterValue === null
  )
    return [];
  return [`${filter.field}="${filterValue}"`];
}

function handleNotEqual(filter: any, filterValue: any, encode: boolean) {
  if (!(filterValue || filterValue === 0)) return [];
  const value = maybeEncode(filterValue, filter.escape && encode);
  return [`${filter.field}!="${value}"`];
}

const getFilters = (body: any, map: Array<FilterMapType>, encode = true) => {
  if (!body) return [];
  const filters: string[] = [];

  map.forEach((filter: any) => {
    let filterValue: any | FilterValueDateType =
      filter.type === 'choiceDate'
        ? body[filter.filter]
        : get(body, filter.filter, null);
    if (typeof filterValue === 'string') filterValue = filterValue.trim();

    let result: string[] = [];
    switch (filter.type) {
      case 'contain':
        result = handleContain(filter, filterValue, encode);
        break;
      case 'match':
        result = handleMatch(filter, filterValue, encode);
        break;
      case 'choiceDate':
        result = handleChoiceDate(filter, filterValue);
        break;
      case 'multi':
        result = handleMulti(filter, filterValue);
        break;
      case 'range':
        result = handleRange(filter, filterValue, body);
        break;
      case 'exact':
        result = handleExact(filter, filterValue);
        break;
      case 'notEqual':
        result = handleNotEqual(filter, filterValue, encode);
        break;
      default:
        break;
    }
    filters.push(...result);
  });

  return filters;
};

export const buildFilter = (
  filterValues: any,
  map: FilterMapType[],
  decorators: any[] = [],
  encode = true
) => {
  let filters = getFilters(filterValues, map, encode);
  decorators.forEach((decorator) => {
    filters = decorator(filters);
  });

  return filters;
};

export const hasLeadStatusFilter = (filters: string[]) =>
  filters.some((filter: string) => filter.indexOf('lead.status') !== -1);

export const getQueryParts = (
  product: string,
  // eslint-disable-next-line default-param-last
  filters: string[] = [],
  pageSize: number,
  page: number,
  orderBy: string,
  policyDateEnabled?: boolean
) => {
  if (
    window.location.href.indexOf('leads/assignment') !== -1 &&
    ((filters && !hasLeadStatusFilter(filters)) || filters.length === 0)
  ) {
    filters.push('lead.status!="LEAD_STATUS_PURCHASED"');
  }

  if (window.location.href.indexOf('leads/rejection') !== -1) {
    filters.push(
      encodeURIComponent(
        'lead.isRejected=false rejections.decideTime="0001-01-01T00:00:00Z"'
      )
    );
  }

  if (
    policyDateEnabled &&
    (window.location.href.indexOf('leads/all') !== -1 ||
      window.location.href.indexOf('leads/assignment') !== -1)
  ) {
    filters.push(
      encodeURIComponent(
        `insurance.policyExpiryDate<="${format(
          addDays(new Date(), 90),
          'yyyy-MM-dd'
        )}" insurance.policyExpiryDate>="0001-01-01T00:00:00Z"`
      )
    );
  }

  if (
    window.location.href.indexOf('leads/my-leads') !== -1 ||
    window.location.href.indexOf('leads/assignment') !== -1
  ) {
    filters.push(encodeURIComponent('lead.isRejected!=true'));
  }

  const pageFrom = (page - 1) * pageSize;
  const queryParts = [`page_size=${pageSize}`];
  if (product) {
    queryParts.unshift(`product=${product}`);
  }

  if (page > 1) {
    queryParts.push(`page_from=${pageFrom}`);
  }

  if (filters.length > 0) {
    queryParts.push(`filter=${filters.join(' ')}`);
  }

  if (orderBy) {
    queryParts.push(orderBy);
  }

  return queryParts;
};
