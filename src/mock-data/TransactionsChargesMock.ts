const TransactionsChargesMock = {
  charges: {
    charges: [],
    nextPageToken: '',
  },
  refunds: {
    refunds: [],
    nextPageToken: '',
  },
  credits: {
    credits: [
      {
        name: 'leads/d409d1c1-0cc6-4cd5-a42f-4777edf3fc4f/credits/f6709d7d-c7b6-4ba8-b4e3-50116532e38e',
        money: {
          currencyCode: 'THB',
          amount: '5000',
        },
        status: 'STATUS_PENDING',
        createTime: '2024-07-04T09:49:41.483967Z',
        updateTime: '2024-07-04T09:49:41.483967Z',
        deleteTime: null,
      },
    ],
    nextPageToken: '',
  },
};

export default TransactionsChargesMock;
