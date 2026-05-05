export interface SelectElement {
  name?: string | undefined;
  value: unknown;
}

export interface AutocompleteOption {
  id?: number | string;
  key?: string;
  title?: string;
  name?: string;
  value: unknown;
}

export type DOB = string | Date | null;
