import { getDefaultEffectiveDate } from 'presentation/pages/admin/AutoAssign/Configs/helper';

import { AutoAssignLeadPayload } from './types';

const isIncludes = (data: any[], comparedBy: string) =>
  data?.some((e) => comparedBy.includes(e));

const getOrderFilter = (orderBy: string) => {
  const config = ['effectiveDate', 'lastImport', 'tier', 'quota', 'absent'];
  const user = ['humanId', 'firstName'];
  const attributes = ['assignedLeadCount'];

  let filterType = 'team';
  if (isIncludes(config, orderBy)) {
    filterType = 'config';
  } else if (isIncludes(user, orderBy)) {
    filterType = 'user';
  } else if (isIncludes(attributes, orderBy)) {
    filterType = 'attributes';
  }
  return `orderBy=${filterType}.${orderBy}&`;
};

const getFilterQuery = (filter: string | null) => {
  const effectiveDate = `config.effectiveDate="${getDefaultEffectiveDate()}"`;
  let filterURL = '';
  const updatedDate = !filter?.includes('effectiveDate') ? effectiveDate : '';
  filterURL +=
    filter && !filter?.includes('filter')
      ? `filter=${filter}${updatedDate}`
      : `filter=${effectiveDate}`;
  return filterURL;
};

// eslint-disable-next-line import/prefer-default-export
export const getFormattedURL = (payload: AutoAssignLeadPayload) => {
  if (!payload?.queryParams) return '';
  const { queryParams } = payload;

  const pageSize = queryParams?.pageSize ?? 15;
  const filter = queryParams?.filter ?? null;
  const orderBy = queryParams?.orderBy ?? null;
  const currentPage = queryParams?.currentPage ?? 1;
  let customURL = '';

  if (pageSize) {
    customURL += `pageSize=${pageSize}&`;
  }
  if (currentPage > 1) {
    customURL += `page_from=${(currentPage - 1) * pageSize}&`;
  }
  if (orderBy) {
    customURL += getOrderFilter(orderBy);
  }
  customURL += getFilterQuery(filter);

  return customURL;
};
