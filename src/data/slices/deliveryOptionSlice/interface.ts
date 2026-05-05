export interface DeliveryOption {
  name: string;
  displayName: string;
  shipmentProvider: string;
  shipmentMethod: string;
  shipmentFee: string;
}

export type DeliveryOptionsResponse = {
  deliveryOptions: DeliveryOption[];
};
