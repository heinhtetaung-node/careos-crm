import _set from 'lodash/set';

import {
  commentExtractByText,
  ExtractType,
  generateInsurerEmailContent,
  getInsurerEmailConfig,
} from './helper';

const mockComments = {
  comments: [
    {
      name: 'orders/9f0cc345-56f3-4dab-b2cd-e7a3172abe9b/comments/50471957-f569-45d6-b9f8-213803bd9dee',
      createTime: '2023-02-28T07:30:13.190866Z',
      updateTime: '2023-02-28T07:30:13.190866Z',
      deleteTime: null,
      createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
      text: '',
      item: '',
    },
  ],
};
const orderName = 'orders/9f0cc345-56f3-4dab-b2cd-e7a3172abe9b';
var mockUnrwap = jest.fn().mockResolvedValue(mockComments);
const mockGetOrderComments = jest.fn().mockImplementation(() => ({
  unwrap: mockUnrwap,
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string) => {
    if (key === 'copyPolicy.includeMandatory') return 'รวม พ.ร.บ.';
    return key;
  }),
}));

describe('Test CopyButton helper function', () => {
  it('Should will not find application number or remark to submission', async () => {
    const [applicationNumber, remarkToSubmission] = await Promise.all([
      commentExtractByText(
        ExtractType.APPLICATION_NUMBER,
        mockGetOrderComments,
        orderName
      ),
      commentExtractByText(
        ExtractType.REMARK_TO_SUBMISSION,
        mockGetOrderComments,
        orderName
      ),
    ]);

    expect(applicationNumber).toBe('');
    expect(remarkToSubmission).toBe('');
  });

  it('Should found the application number', async () => {
    mockUnrwap = jest
      .fn()
      .mockResolvedValue(
        _set(
          mockComments,
          'comments.[0].text',
          'something else // เลขรับแจ้ง 99582/รย/22112 // กธ. 65003/กธ/E73263 // พรบ.65003-E703480'
        )
      );
    const applicationNumber = await commentExtractByText(
      ExtractType.APPLICATION_NUMBER,
      mockGetOrderComments,
      orderName
    );

    expect(applicationNumber).toBe('99582/รย/22112');
  });

  it('Should found the remark to submission', async () => {
    mockUnrwap = jest
      .fn()
      .mockResolvedValue(
        _set(
          mockComments,
          'comments.[0].text',
          'Athiwat Upatam แสดงความคิดเห็น\n\n***Remark to submission***\nรบกวนประสานงานตรวจสภาพรถด่วน \nนัดหมายตรวจสภาพรถยนต์ที่ ติดต่อ คุณนัท 0865656591\nเคสนี้ลูกค้าต้องการเป็นไฟล์ PDF ด่วนเพื่อส่งใหเไฟแนนซ์ วันที่ 21/12/2565\nรบกวนระบุในการมธรรม์ผู้รับผลประโยชคือ TTB ทีเอ็มบีธนชาต \nขอบคุณครับ\n\n19/12/2022 (01:52:12 PM)'
        )
      );
    const remarkToSubmission = await commentExtractByText(
      ExtractType.REMARK_TO_SUBMISSION,
      mockGetOrderComments,
      orderName
    );

    expect(remarkToSubmission).toMatch(/ขอบคุณครับ/);
  });
});

describe('Test getInsurerEmailConfig function', () => {
  it('Should return default email config for known insurer', () => {
    const result = getInsurerEmailConfig('insurers/27', '', '');

    expect(result).toEqual({
      to: 'lpn_insure@viriyah.co.th',
      cc: ['Followup@rabbit.co.th'],
    });
  });

  it('Should return fallback config for unknown insurer', () => {
    const result = getInsurerEmailConfig('insurers/999', '', '');

    expect(result).toEqual({
      to: '',
      cc: ['Followup@rabbit.co.th'],
    });
  });

  it('Should return renewal config for LMG (insurers/33) when lead type is LEAD_TYPE_RENEWAL', () => {
    const result = getInsurerEmailConfig(
      'insurers/33',
      '',
      'LEAD_TYPE_RENEWAL'
    );

    expect(result).toEqual({
      to: 'LMG_OPT_RENEW@lmginsurance.co.th',
      cc: [
        'IDS-VIP@lmginsurance.co.th',
        'isaveeporn.k@lmginsurance.co.th',
        'Followup@rabbit.co.th',
      ],
    });
  });

  it('Should return default config for LMG (insurers/33) when lead type is not LEAD_TYPE_RENEWAL', () => {
    const result = getInsurerEmailConfig('insurers/33', '', 'LEAD_TYPE_NEW');

    expect(result).toEqual({
      to: 'LMG_OPT_NEW@lmginsurance.co.th',
      cc: [
        'IDS-VIP@lmginsurance.co.th',
        'isaveeporn.k@lmginsurance.co.th',
        'Followup@rabbit.co.th',
      ],
    });
  });

  it('Should return truck submission config for BKI (insurers/7) when OIC code is TYPE_320', () => {
    const result = getInsurerEmailConfig('insurers/7', 'TYPE_320', '');

    expect(result).toEqual({
      to: 'umaporn.s@bangkokinsurance.com',
      cc: [
        'Pornpen.l@bangkokinsurance.com',
        'suparat.w@bangkokinsurance.com',

        'Followup@rabbit.co.th',
      ],
    });
  });

  it('Should handle edge case with empty strings', () => {
    const result = getInsurerEmailConfig('', '', '');

    expect(result).toEqual({
      to: '',
      cc: ['Followup@rabbit.co.th'],
    });
  });
});

describe('Test generateInsurerEmailContent function', () => {
  const mockOrderPolicy = {
    order: {
      lead: 'leads/test-lead-id',
      data: {
        carLicensePlate: 'ABC-123',
        policyHolder: {
          title: 'MR',
        },
        oicCode: 'TYPE_110',
        firstDriverDOB: '1990-01-01',
      },
    },
    policy: {
      insurer: 'insurers/27',
      policyStartDate: '2023-12-01T00:00:00Z',
      motorItemType: 'PRIVATE_CAR',
      sumInsured: 50000000, // 500,000 baht in satang
    },
    policyHolderName: 'John Doe',
    motorPackage: {
      carRepairType: 'GARAGE',
    },
    customerInfo: {
      phones: [{ phone: '+66812345678' }],
    },
  };

  const mockOrderData = {
    items: [
      {
        package: {
          insuranceCategory: 'VOLUNTARY',
        },
      },
    ],
    order: {
      data: {
        firstDriverDOB: '1990-01-01',
      },
    },
  };

  const mockLeadDetail = {
    type: 'LEAD_TYPE_NEW',
  };

  const mockGetLeadById = jest.fn().mockImplementation(() => ({
    unwrap: jest.fn().mockResolvedValue(mockLeadDetail),
  }));

  const mockGetOrderCommentsLocal = jest.fn().mockImplementation(() => ({
    unwrap: jest.fn().mockResolvedValue({ comments: [] }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate email content with basic order policy data', async () => {
    const result = await generateInsurerEmailContent(
      mockOrderPolicy,
      mockOrderData,
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsLocal
    );

    expect(result).toEqual({
      emailAddress: 'lpn_insure@viriyah.co.th',
      emailCcs: ['Followup@rabbit.co.th'],
      emailSubject: expect.stringContaining('ABC-123'),
      emailBody: expect.stringContaining('John Doe'),
    });

    expect(mockGetLeadById).toHaveBeenCalledWith('test-lead-id');
  });

  it('should handle order policy without lead data', async () => {
    const orderPolicyWithoutLead = {
      ...mockOrderPolicy,
      order: {
        ...mockOrderPolicy.order,
        lead: null,
      },
    };

    const result = await generateInsurerEmailContent(
      orderPolicyWithoutLead,
      mockOrderData,
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsLocal
    );

    expect(result.emailAddress).toBe('lpn_insure@viriyah.co.th');
    expect(mockGetLeadById).not.toHaveBeenCalled();
  });

  it('should include mandatory insurance when found in order data', async () => {
    const orderDataWithMandatory = {
      ...mockOrderData,
      items: [
        {
          package: {
            insuranceCategory: 'MANDATORY',
          },
        },
      ],
    };

    const result = await generateInsurerEmailContent(
      mockOrderPolicy,
      orderDataWithMandatory,
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsLocal
    );

    expect(result.emailBody).toContain('รวม พ.ร.บ.');
  });

  it('should include application number and remark when available in comments', async () => {
    const mockGetOrderCommentsWithData = jest
      .fn()
      .mockImplementationOnce(() => ({
        unwrap: jest.fn().mockResolvedValue({
          comments: [{ text: 'เลขรับแจ้ง 12345/test/67' }],
        }),
      }))
      .mockImplementationOnce(() => ({
        unwrap: jest.fn().mockResolvedValue({
          comments: [{ text: 'Remark to submission\nTest remark content' }],
        }),
      }));

    const result = await generateInsurerEmailContent(
      mockOrderPolicy,
      mockOrderData,
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsWithData
    );

    expect(result.emailBody).toContain('12345/test/67');
    expect(result.emailBody).toContain('Test remark content');
  });

  it('should handle missing optional data gracefully', async () => {
    const minimalOrderPolicy = {
      order: { data: {} },
      policy: {},
    };

    const result = await generateInsurerEmailContent(
      minimalOrderPolicy,
      { items: [], order: { data: {} } },
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsLocal
    );

    expect(result.emailAddress).toBe('');
    expect(result.emailCcs).toEqual(['Followup@rabbit.co.th']);
    expect(result.emailSubject).toBeDefined();
    expect(result.emailBody).toBeDefined();
  });

  it('should format phone number correctly by removing +66 prefix', async () => {
    const orderPolicyWithPhone = {
      ...mockOrderPolicy,
      customerInfo: {
        phones: [{ phone: '+66987654321' }],
      },
    };

    const result = await generateInsurerEmailContent(
      orderPolicyWithPhone,
      mockOrderData,
      'test-order-id',
      mockGetLeadById,
      mockGetOrderCommentsLocal
    );

    expect(result.emailBody).toContain('0987654321');
  });

  it('should use correct email configuration for different insurer types', async () => {
    // Test LMG renewal configuration
    const lmgRenewalOrderPolicy = {
      ...mockOrderPolicy,
      policy: {
        ...mockOrderPolicy.policy,
        insurer: 'insurers/33',
      },
    };

    const renewalLeadDetail = {
      type: 'LEAD_TYPE_RENEWAL',
    };

    const mockGetLeadByIdRenewal = jest.fn().mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue(renewalLeadDetail),
    }));

    const result = await generateInsurerEmailContent(
      lmgRenewalOrderPolicy,
      mockOrderData,
      'test-order-id',
      mockGetLeadByIdRenewal,
      mockGetOrderCommentsLocal
    );

    expect(result.emailAddress).toBe('LMG_OPT_RENEW@lmginsurance.co.th');
    expect(result.emailCcs).toContain('IDS-VIP@lmginsurance.co.th');
  });
});
