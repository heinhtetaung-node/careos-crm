export enum FileCheckStatus {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'failure',
}
export interface Column {
  id: string;
  field?: string;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
  disabled?: boolean;
}

export type TypeFile = {
  fileName: '';
  fileType: '';
  fileSize: 0;
  result: [];
  name: '';
  isEmptyFileMessage: string;
};

export type TemplateWithType = {
  name: string;
  dataType: string;
};
