import { ClassNameMap } from '@material-ui/styles';

import { AssignmentParams } from 'data/slices/autoAssignLeadSlice/types';

export interface SettingModalProps {
  onClose: (status?: boolean) => void;
  className?: ClassNameMap<string>;
  values: AssignmentParams | undefined;
}

export interface StatusModalProps {
  id: string;
  onClose: (status?: boolean) => void;
}
export interface HeaderOption {
  title: string;
  content: JSX.Element;
}

export type FilterParam = Record<
  string,
  Array<{ key?: string; name?: string }> | Date | string | undefined
>;
