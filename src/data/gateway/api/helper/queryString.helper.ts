import { formatISO } from 'date-fns';

import { getString } from 'presentation/theme/localization';

export interface IPayLoad {
  [key: string]: number | string | boolean;
}

export interface IPageToken {
  page: number;
  token: string;
}

export interface IPayLoadDynamic {
  createTime?: {
    criteria: string;
    range: {
      startDate: Date | null;
      endDate: Date | null;
    };
  };
  [key: string]: any;
}

const FILTER_FIELDS = [
  'online',
  'hidden',
  'source',
  'score',
  'medium',
  'campaign',
  'createBy',
  'createTime',
  'customerType',
  'deleteTime',
  'displayName',
  'manager',
  'name',
  'productType',
  'product',
  'teamProduct',
  'supervisor',
  'updateTime',
  'updateBy',
  'role',
  'humanId',
  'fullName',
  'userFullName',
  'team',
  'teamDisplayName',
  'leadType',
  'annotations.score',
];

const MAX_LENGTH_STATUS = 2;
const BOOLEAN_FIELDS = ['online', 'hidden'];

export const queryString = (payload: IPayLoad) => {
  const str: string[] = [];
  Object.keys(payload).forEach((key) => {
    if (
      Object.prototype.hasOwnProperty.call(payload, key) &&
      key !== 'orderBy'
    ) {
      if (payload[key]) {
        str.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}`
        );
      }
    }
  });
  return str.join('&');
};

export const updateTokenList = (
  page: number,
  token: string,
  tokenList: IPageToken[] = []
) => {
  let newTokenList = [...tokenList];
  const pageItem = newTokenList.find((item) => item.page === page);
  if (pageItem) {
    newTokenList = newTokenList.map((item) => {
      const tokenItem = item.token;
      return {
        ...item,
        token: item.page === page ? token : tokenItem,
      };
    });
  } else {
    newTokenList.push({ page, token });
  }
  return newTokenList;
};

interface ITeam {
  displayName: string;
}

export const queryStringDynamic = (payload: IPayLoadDynamic) => {
  let queries = '';
  Object.keys(payload).forEach((key) => {
    switch (key) {
      case 'userCount': {
        if (payload.userCount) {
          const [min, max] = payload.userCount;
          if (max !== 0) {
            queries += `memberCount>= ${min} memberCount<=${max}`;
          }
        }
        break;
      }

      case 'userFullName': {
        if (payload.userFullName) {
          queries += `fullName: "${payload.userFullName.trim()}" `;
        }
        break;
      }

      case 'status': {
        if (payload.status) {
          if (payload.status.length === MAX_LENGTH_STATUS) {
            return null;
          }
          payload.status.forEach((item: any) => {
            if (item.title === getString('statusOptions.active')) {
              queries += '';
            } else if (item.title === getString('statusOptions.suspended')) {
              queries += 'deleteTime>"2000-01-01T00:00:00Z"';
            } else {
              queries += '';
            }
          });
        }
        break;
      }

      case 'createTime': {
        if (payload.createTime) {
          const { criteria, range } = payload.createTime;
          const { startDate, endDate } = range;
          if (startDate && endDate) {
            queries += ` ${
              criteria.toLowerCase().includes('create')
                ? 'createTime'
                : 'updateTime'
            }: ["${formatISO(startDate)}", "${formatISO(endDate)}"]`;
          }
        }

        break;
      }

      case 'createBy': {
        if (payload.createBy) {
          queries += ` createBy = "${payload.createBy.value}"`;
        }
        break;
      }

      case 'updateBy': {
        if (payload.updateBy) {
          queries += ` updateBy = "${payload.updateBy.value}"`;
        }
        break;
      }

      case 'score': {
        if (payload.score.length) {
          const values = payload[key].map(({ value }: any) => `${value}`);
          queries += `${key} in (${values}) `;
        }
        break;
      }

      case 'teamDisplayName': {
        if (payload.teamDisplayName.length) {
          const values = payload[key].map(
            ({ displayName }: ITeam) => `"${displayName}"`
          );
          queries += `${key} in (${values}) `;
        }
        break;
      }

      default:
        if (FILTER_FIELDS.includes(key)) {
          if (payload[key]) {
            if (Array.isArray(payload[key]) && payload[key].length) {
              const values = payload[key].map(
                ({ title, value }: any) => `"${value || title}"`
              );
              queries += `${key} in (${values}) `;
            } else if (BOOLEAN_FIELDS.includes(key) && payload[key].value) {
              queries += `${key}= ${payload[key].value} `;
            } else if (payload[key] && payload[key].value) {
              queries += `${key}: "${payload[key].value}" `;
            } else if (
              key &&
              payload[key] &&
              typeof payload[key] === 'string'
            ) {
              queries += `${key}="${payload[key]}"`;
            }
          }
        }

        break;
    }
    return null;
  });

  return queries.trim();
};
