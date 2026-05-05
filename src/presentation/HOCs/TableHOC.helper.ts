export interface IColumn {
  title: string;
  field: string;
  localisationKey?: string;
  role?: string;
}

export const renewalColumns: IColumn[] = [
  { title: 'text.leadType', field: 'lead_type' },
  { title: 'text.lastPremium', field: 'last_premium' },
  { title: 'text.lifeTime', field: 'life_time' },
  { title: 'text.webActivity', field: 'web_activity' },
  { title: 'text.sum', field: 'sum' },
];

export const retainerColumns: IColumn[] = [
  { title: 'text.leadType', field: 'lead_type' },
  { title: 'text.leadAge', field: 'lead_age' },
  { title: 'text.sumInsuredLabel', field: 'sum_insured' },
  { title: 'text.webActivity', field: 'web_activity' },
  { title: 'text.sum', field: 'sum' },
];

export const newColumns: IColumn[] = [
  { title: 'text.leadType', field: 'lead_type' },
  { title: 'text.leadSource', field: 'lead_source' },
  { title: 'text.sumInsuredLabel', field: 'sum_insured' },
  { title: 'text.webActivity', field: 'web_activity' },
  { title: 'text.sum', field: 'sum' },
];

export const overflowColumns: IColumn[] = [
  {
    title: 'Lead/Priority',
    field: 'lead_type',
    localisationKey: 'leadPriority',
    role: '',
  },
  {
    title: 'Priority A1',
    field: 'sum_insured',
    localisationKey: 'priority',
    role: 'A1',
  },
  {
    title: 'Priority A2',
    field: 'lead_source',
    localisationKey: 'priority',
    role: 'A2',
  },
  {
    title: 'Priority A3',
    field: 'web_activity',
    localisationKey: 'priority',
    role: 'A3',
  },
  {
    title: 'Priority A4',
    field: 'sum',
    localisationKey: 'priority',
    role: 'A4',
  },
];
