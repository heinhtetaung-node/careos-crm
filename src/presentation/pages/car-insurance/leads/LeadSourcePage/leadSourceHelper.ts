import { isEmpty } from 'lodash';

import { PRODUCT_TYPE } from 'config/TypeFilter';
import {
  FilterMapType,
  buildFilter,
} from 'data/gateway/api/resource/leadSearch';
import { getString } from 'presentation/theme/localization';
import { NewDateFormatters } from 'shared/helper/utilities';
import { IPageState } from 'shared/interfaces/common/table';

export interface Column {
  id: string;
  label: string;
  field: string;
  align?: 'right' | 'center' | 'left';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
}

export const getLocaleOptions = (options: any[], key: string) =>
  options.map((option: any) => {
    const keyToTranslate: string = option[key];
    return {
      ...option,
      [key]: getString(keyToTranslate),
    };
  });

export type Source = {
  medium: string;
  campaign: string;
  source: string;
  name?: string;
  online: boolean;
  createByFullName: string;
  updateByFullName?: string;
};

export const getSourceOptions = (
  data: Source[],
  key: keyof Source,
  onlyOnline = false
) => {
  let options: any[];
  if (onlyOnline) {
    options = data
      .filter((source) => source.online)
      .map((source) => source[key]);
  } else {
    options = data.map((source) => source[key]);
  }
  return Array.from(new Set(options))
    .filter((item) => !isEmpty(item))
    .map((item, index) => ({
      id: index,
      title: item,
      value: item,
      name: data[index]?.name,
    }));
};

export const initialPageState: IPageState = {
  currentPage: 1,
  pageSize: 15,
  pageToken: '',
  orderBy: '',
  filter: '',
};

export const columnsV2 = () => {
  const { DDMMYYYY } = NewDateFormatters();
  return [
    {
      id: 'type',
      label: 'text.type',
      field: 'sourceWithScore.online',
      align: 'center',
      format: 'string',
      sorting: 'none',
      transform: ({ online }: any) => (online ? 'Online' : 'Offline'),
    },
    {
      id: 'source',
      field: 'sourceWithScore.source',
      label: 'text.source',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'medium',
      field: 'sourceWithScore.medium',
      label: 'text.medium',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'campaign',
      field: 'sourceWithScore.campaign',
      label: 'text.campaign',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'product',
      field: 'sourceWithScore.product',
      label: 'text.product',
      format: 'string',
      sorting: 'none',
      transform: ({ product }: any) => PRODUCT_TYPE[product] ?? '',
    },
    {
      id: 'leadCount',
      field: 'sourceWithScore.leadCount',
      label: 'text.leadCount',
      format: 'string',
      align: 'center',
      sorting: 'none',
    },
    {
      id: 'hide',
      field: 'sourceWithScore.hidden',
      label: 'text.hide',
      format: 'date',
      sorting: 'none',
      transform: ({ hidden }: any) => (hidden ? 'Yes' : 'No'),
    },
    {
      id: 'createByFullName',
      field: 'sourceWithScore.createByFullName.keyword',
      label: 'text.createBy',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'updateByFullName',
      field: 'sourceWithScore.updateByFullName.keyword',
      label: 'text.updateBy',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'createTime',
      field: 'createTime',
      label: 'text.createOn',
      format: 'Created On',
      sorting: 'desc',
      transform: ({ createTime }: any) => DDMMYYYY(createTime),
    },
    {
      id: 'updateTime',
      field: 'updateTime',
      label: 'text.updatedOn',
      format: 'Updated On',
      sorting: 'none',
      transform: ({ updateTime }: any) => DDMMYYYY(updateTime),
    },
  ] as Column[];
};

export const fieldMapper: FilterMapType[] = [
  {
    filter: 'online.value',
    type: 'match',
    field: 'sourceWithScore.online',
  },
  {
    filter: 'source',
    type: 'multi',
    field: 'sourceWithScore.source',
    callback: (source: Record<string, string>) => source?.value,
  },
  {
    filter: 'campaign',
    type: 'multi',
    field: 'sourceWithScore.campaign',
    callback: (campaign: Record<string, string>) => campaign?.value,
  },
  {
    filter: 'medium',
    type: 'multi',
    field: 'sourceWithScore.medium',
    callback: (medium: Record<string, string>) => medium?.value,
  },
  {
    filter: 'hidden.value',
    type: 'match',
    field: 'sourceWithScore.hidden',
  },
  {
    filter: 'score',
    type: 'multi',
    field: 'sourceWithScore.score',
    callback: (score: Record<string, string>) => score?.value,
  },
  {
    filter: 'createBy',
    type: 'match',
    field: 'sourceWithScore.createByFullName.keyword',
    callback: (createBy: Record<string, string>) => createBy?.value,
  },
  {
    filter: 'updateBy',
    type: 'match',
    field: 'sourceWithScore.updateByFullName.keyword',
    callback: (updateBy: Record<string, string>) => updateBy?.value,
  },
  {
    filter: 'createTime',
    type: 'choiceDate',
    options: [
      { filter: 'createTime', field: 'sourceWithScore.createTime' },
      { filter: 'updateTime', field: 'sourceWithScore.updateTime' },
    ],
  },
];

export const getFilterPanelQueryString = ({ filters }: { filters: any }) => {
  const filterStrings = [...buildFilter(filters, fieldMapper, [], false)];
  return filterStrings.join(' ');
};
