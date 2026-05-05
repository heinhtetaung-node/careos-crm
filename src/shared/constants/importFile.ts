export enum ImportType {
  Lead = 'LEAD',
  Package = 'PACKAGE',
  CarSubModel = 'CAR_PRICE',
  CustomerProfile = 'CUSTOMER',
  AutoAssignLeadConfig = 'LEAD_AUTOASSIGNMENT_CONFIG',
  CuratedCar = 'CURATED_CAR',
  MassLead = 'LEAD_ASSIGNMENT',
  Discounts = 'AGENT_DISCOUNT_RULE',
  DiscountsApproval = 'DISCOUNT_APPROVAL',
  Brand = 'CAR_BRAND',
  Model = 'CAR_MODEL',
  OrderStatus = 'ORDER_STATUS',
  Accounting = 'ACCOUNTING',
  Redbook = 'REDBOOK',
}

export enum ImportStatus {
  Default = 'default',
  Success = 'success',
  Failure = 'failure',
}
