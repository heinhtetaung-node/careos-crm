import { get } from 'lodash';

export interface QueryProps {
  pageSize: number;
  filter?: string | null;
  orderBy?: string | null;
  currentPage?: number;
}
export interface PayloadProps {
  queryParams: QueryProps;
}

export default function getFormattedURL(payload: PayloadProps) {
  if (!payload?.queryParams) return undefined;
  const {
    pageSize = 15,
    filter = null,
    orderBy = null,
    currentPage = 1,
    ...rest
  } = payload.queryParams;

  const customURL = new URLSearchParams();

  if (pageSize) {
    customURL.append('pageSize', pageSize.toString());
  }

  if (currentPage > 1) {
    customURL.append('page_from', ((currentPage - 1) * pageSize).toString());
  }

  if (orderBy) {
    customURL.append('orderBy', orderBy);
  }

  if (filter) {
    customURL.append('filter', filter);
  }

  Object.keys(rest).forEach((key) => {
    // eslint-disable-next-line no-unused-expressions
    get(rest, key) && customURL.append(key, get(rest, key));
  });

  return customURL;
}
