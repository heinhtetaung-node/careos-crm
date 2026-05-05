import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';

import { transformDiscountResponse } from './helper';

describe('Testing transformDiscountResponse helper function', () => {
  it('should return formatted response as per given data', () => {
    const resp = transformDiscountResponse({
      requests: DiscountMockData.discounts as any,
      total: 1,
    });
    expect(resp).toStrictEqual({
      imports: [
        {
          agentName: 'SalesAgentRole -',
          approvalReason: 'test discount',
          approvalTime: '',
          approver: 'first last',
          configId:
            'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72/renewalPackages/e6cdc351-ea65-4716-afcc-324edca4b035/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
          description: 'test discount',
          discount: 'percentage',
          discountType: 'match-price',
          index: 1,
          insuranceType: '',
          insurer: '',
          leadId: 'L9898200',
          leadName: 'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72',
          maxDiscount: 8,
          name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
          leadType: 'leadTypeFilter.renewal',
          priceAfterDiscount: '11.17',
          priceBeforeDiscount: '12',
          requestDiscount: '6.9%',
          requestTime: '',
          status: 'PENDING',
          category: 'healthPackageFilter.productCategoryValue.undefined',
        },
      ],
      total: 1,
    });
  });
  it('should return formatted response as per given data', () => {
    const resp = transformDiscountResponse({
      requests: [
        {
          ...DiscountMockData.discounts[0],
          request: {
            ...DiscountMockData.discounts[0].request,
            amount: 12_000,
            package: {
              price: 140_000,
              type: 'STANDARD',
            },
          },
        },
      ] as any,
      total: 1,
    });
    expect(resp).toStrictEqual({
      imports: [
        {
          agentName: 'SalesAgentRole -',
          approvalReason: 'test discount',
          approvalTime: '',
          approver: 'first last',
          configId:
            'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72/renewalPackages/e6cdc351-ea65-4716-afcc-324edca4b035/requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
          description: 'test discount',
          discount: 'amount',
          discountType: 'match-price',
          index: 1,
          insuranceType: '',
          insurer: '',
          leadId: 'L9898200',
          leadName: 'leads/79e8b6f2-4766-4262-8a19-1cc2ab800c72',
          maxDiscount: 8,
          name: 'requests/a532d5ed-f5cb-4458-b9a3-4df6ea315dc2',
          leadType: 'leadTypeFilter.renewal',
          priceAfterDiscount: '1,280',
          priceBeforeDiscount: '1,400',
          requestDiscount: '12,000 healthPackage.thb',
          requestTime: '',
          status: 'PENDING',
          category: 'healthPackageFilter.productCategoryValue.undefined',
        },
      ],
      total: 1,
    });
  });
});
