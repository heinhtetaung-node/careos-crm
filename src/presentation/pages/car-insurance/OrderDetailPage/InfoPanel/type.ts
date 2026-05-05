export interface DeliveryOptionsSelect {
  id: string | number;
  title: string;
  name: string;
  method?: string;
  shipmentFee?: string;
}

export interface IField {
  title?: string;
  type: 'text' | 'select' | 'date' | 'license' | 'field' | 'subTitle' | 'datef';
  value: any; // FIXME
  disabled?: boolean;
  isEditable?: boolean;
  name?: string;
  onChange?: (payload: any) => void;
  titleString?: string;
  optional?: any;
  error?: object;
  testId?: string;
  isOptional?: boolean;
  options?: DeliveryOptionsSelect[];
  packageTypeLabel?: string | null;
}
