import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';
import { mockTransactionsSnapshot } from 'mock-data/TransactionFee.mock';
import TransactionsChargesMock from 'mock-data/TransactionsChargesMock';

import {
  useLazyGetTransactionByIdQuery,
  useLazyGetSuccessfulTransactionQuery,
  useLazyGetTransactionFeeQuery,
  useGetPriceDetailQuery,
  useGetTransactionHistoryQuery,
} from './index';

describe('transactionSlice', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId/successfulTransactionDetails`,
        () =>
          HttpResponse.json({
            transaction: {
              name: 'transactions/1d26a1a4-da4e-4333-975d-b7eb9b1c2668',
              createTime: '2022-11-25T04:24:53.000331Z',
              updateTime: '2022-11-25T04:25:51.009240Z',
              money: {
                currencyCode: 'THB',
                amount: '1663600',
              },
              installments: 1,
              lead: 'leads/605cf075-df64-410c-a149-c5671ef5bae2',
              leadHumanId: 'L9890643',
              order: '',
              gatewayReference: 'gateway-references/ICO-L9890643-221125112451',
              statusCode: 'SUCCESSFUL',
              paymentOption: 'PAYMENT_OPTION_UNKNOWN',
            },
            charges: [
              {
                name: 'transactions/1d26a1a4-da4e-4333-975d-b7eb9b1c2668/charges/40f50bc8-8f16-4008-8132-14a902d4656c',
                createTime: '2022-11-24T04:25:50.097385Z',
                updateTime: '2022-11-25T04:25:50.996298Z',
                money: {
                  currencyCode: 'THB',
                  amount: '1663600',
                },
                serviceProvider: 'ICOLLECTION',
                paymentMethod: 'ONLINECARD',
                returnUri: '',
                authorizeUri: '',
                token: '',
                status: 'SUCCESSFUL',
                thirdPartyId: 'OR6511000122',
                sourceUri: '',
                errorCode: '',
                httpStatusCode: 200,
                errorMessage: '',
                installmentNumber: 1,
              },
              {
                name: 'transactions/1d26a1a4-da4e-4333-975d-b7eb9b1c2668/charges/40f50bc8-8f16-4008-8132-14a902d4656c',
                createTime: '2022-11-26T04:25:50.097385Z',
                updateTime: '2022-11-26T04:25:50.996298Z',
                money: {
                  currencyCode: 'THB',
                  amount: '1663700',
                },
                serviceProvider: 'ICOLLECTION',
                paymentMethod: 'ONLINECARD',
                returnUri: '',
                authorizeUri: '',
                token: '',
                status: 'SUCCESSFUL',
                thirdPartyId: 'OR6511000122',
                sourceUri: '',
                errorCode: '',
                httpStatusCode: 200,
                errorMessage: '',
                installmentNumber: 1,
              },
            ],
          })
      )
    );
  });
  it('should sort and get first charge date as paidDate', async () => {
    const { result } = renderHook(() => useLazyGetSuccessfulTransactionQuery());
    const response = await (result.current as any)[0]?.('leads/leadId');
    expect(response.data.paidDate).toBe('2022-11-25T04:25:50.996298Z');
  });

  it('should get paidAmount correctly', async () => {
    const { result } = renderHook(() => useLazyGetSuccessfulTransactionQuery());
    const response = await (result.current as any)[0]?.('leads/leadId');
    expect(response.data.paidAmount).toBe('16636');
  });
});

test('should get transaction fee correctly', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/financialtransaction/v1alpha3/transactions/paymentId/snapshots/current`,
      () => HttpResponse.json(mockTransactionsSnapshot)
    )
  );

  const { result } = renderHook(() => useLazyGetTransactionFeeQuery());
  const response = await (result.current as any)[0]?.('transactions/paymentId');
  expect(response.data.priceSummary.processingFeeAmount).toBe('0.5');
});

test('should get transaction details by id correctly', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/financialtransaction/v1alpha3/prices/paymentId`,
      () =>
        HttpResponse.json({
          price: {
            priceDetail: {
              priceSummary: {
                netPremiumAmount: '300000',
              },
            },
            packageResource: {
              carPackage: {
                packagePrice: {
                  voluntaryPrice: '2839200',
                },
              },
            },
          },
        })
    )
  );
  const { result } = renderHook(() => useLazyGetTransactionByIdQuery());
  const response = await (result.current as any)[0]?.({
    paymentId: 'prices/paymentId',
  });
  expect(response.data.invoicePrice).toBe(3000);
  expect(response.data.voluntaryPrice).toBe(28392);
});

test('should get transaction payment history details correctly', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/gff/v1alpha1/transactions/:transactionID:paymentHistory`,
      () => HttpResponse.json(TransactionsChargesMock)
    )
  );

  const { result } = renderHook(() =>
    useGetTransactionHistoryQuery({ transactionId: 'transactions/123' })
  ) as any;
  await waitFor(() => {
    expect(result.current.status).not.toBe('pending');
    expect(result.current.currentData.credits.credits.length).toBeGreaterThan(
      0
    );
  });
});

test('should get price detail correctly', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/financialtransaction/v1alpha3/prices/:priceId`,
      () =>
        HttpResponse.json({
          price: {
            name: 'prices/b9043a9f-0d33-4d6a-8752-884e8338dc57',
            priceDetail: {
              resourceName: 'packages/1357848',
              priceSummary: {
                interestRate: 2.5,
                interestAmount: '61840',
                processingFeeRate: 0.5,
                processingFeeAmount: '12368',
                feeRate: 3,
                feeAmount: '74208',
                discountRate: 3,
                discountAmount: '76500',
                netDiscountRate: -0.09,
                netDiscountAmount: '-2292',
                packagePriceAfterDiscount: '2473500',
                netPremiumAmount: '2547708',
                initialAmount: '424618',
                subsequentAmount: '424618',
                discount: {
                  type: 'DISCOUNT_TYPE_RCL',
                  percentage: 300,
                  amount: '76500',
                },
                shipmentFee: '0',
                feeAmountNoShip: '74208',
                vatRate: 7,
                vatAmount: '166823',
                stampRate: 0.4,
                stampAmount: '9500',
                whtRate: 1,
                whtAmount: '0',
              },
              installmentDetails: [
                {
                  period: 1,
                  paymentAmount: '424618',
                  principal: '412250',
                  addOns: '0',
                  interest: '0',
                  processingFee: '12368',
                  principalBalance: '2061250',
                  interestBalance: '61840',
                  processingFeeBalance: '0',
                  totalBalance: '2123090',
                },
                {
                  period: 2,
                  paymentAmount: '424618',
                  principal: '404140',
                  addOns: '0',
                  interest: '20479',
                  processingFee: '0',
                  principalBalance: '1657110',
                  interestBalance: '41362',
                  processingFeeBalance: '0',
                  totalBalance: '1698472',
                },
                {
                  period: 3,
                  paymentAmount: '424618',
                  principal: '408155',
                  addOns: '0',
                  interest: '16463',
                  processingFee: '0',
                  principalBalance: '1248956',
                  interestBalance: '24899',
                  processingFeeBalance: '0',
                  totalBalance: '1273854',
                },
              ],
            },
            paymentOption: 'RABBIT_CARE_INSTALLMENT',
            paymentMethod: 'QR_CODE',
            numberOfInstallments: 6,
            cardProvider: '',
            createTime: '2024-03-18T06:18:27.083551Z',
            updateTime: '2024-03-18T06:18:27.083551Z',
            discountEntity: {
              name: 'leads/6b13e4af-9c2b-426c-9610-412908d11a34/packages/1357848/discounts/199615ef-e425-4a41-866f-6db7337dfb14',
              requestResource: '',
              source: '',
              amount: 0,
              percentage: 300,
              type: 'DISCOUNT_TYPE_RCL',
              createTime: '2024-03-18T06:18:26.993525Z',
              updateTime: '2024-03-18T06:18:26.993525Z',
              deleteTime: null,
              createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
            },
            discountType: 'DISCOUNT_TYPE_RCL',
            packageResource: {
              carPackage: {
                package: 'packages/1357848',
                packagePrice: {
                  voluntaryPrice: '2550000',
                  compulsoryPrice: '0',
                  discount: {
                    type: 'DISCOUNT_TYPE_RCL',
                    percentage: 300,
                    amount: '0',
                  },
                },
                insurer: 'insurers/27',
                insuranceType: 'TYPE_1',
              },
            },
          },
        })
    )
  );

  const { result } = renderHook(() =>
    useGetPriceDetailQuery({ priceId: 'prices/123' })
  ) as any;
  await waitFor(() => {
    expect(result.current?.price).not.toBeNull();
  });
});
