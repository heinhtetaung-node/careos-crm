export interface IInitialUser {
  [key: string]: string | number | boolean | any;
}

export interface ICreateUserProps {
  userData?: any;
  onClose?: () => void;
  isEdit?: boolean;
  setShouldFetch?: (value: boolean) => void;
}
