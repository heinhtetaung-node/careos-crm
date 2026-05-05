import { IFilterFormField } from 'shared/interfaces/common';

export interface IFilterComponent {
  fields: IFilterFormField[];
  onSubmit: () => void;
  onCancel: () => void;
}
