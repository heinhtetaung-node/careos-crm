export interface Refund {
  attributes: {
    product: string;
    orderHumanId: string;
    customerFirstname: string;
    customerPhone: string;
    orderItemHumanId: string;
    customerFullName: string;
    customerLastname: string;
  };
  refund: {
    status: string;
    errorMessage: string;
    bank: string;
    bankAccountNumber: string;
    humanId: string;
    money: {
      currencyCode: string;
      amount: string;
    };
    httpStatusCode: number;
    errorCode: string;
    name: string;
    document: string;
    serviceProvider: string;
    paymentMethod: string;
    updateTime: string;
    refundDate: string;
    orderItem: string;
    createTime: string;
  };
}

export interface IRefundResponse {
  refunds: Refund[];
  total: string;
}
