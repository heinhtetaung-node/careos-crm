import { formatFilterURI } from './helper';

import { initialFilterValues } from '../common/helper';

describe('Testing Helper functions', () => {
  it('should return correct formatted url if lead id is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      search: {
        inputValue: 'L9894192',
        selectValue: 'transaction.leadHumanId.keyword',
        'transaction.leadHumanId.keyword': 'L9894192',
      },
    });

    expect(Uri).toBe(`transaction.leadHumanId.keyword="L9894192"`);
  });
  it('should return correct formatted url if customer name is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      search: {
        inputValue: 'test',
        selectValue: 'customerName',
        customerName: 'test',
      },
    });

    expect(Uri).toBe(`attributes.lead.customerFullName:"test"`);
  });
  it('should return correct formatted url if customer phone is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      search: {
        inputValue: '+121212121',
        selectValue: 'attributes.customerPhone',
        'attributes.customerPhone': '+121212121',
      },
    });

    expect(Uri).toBe(`attributes.lead.customerPhone="121212121"`);
  });
  it('should return correct formatted url if license plate is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      search: {
        selectValue: 'attributes.lead.carLicensePlate.keyword',
        inputValue: '1212',
        'attributes.lead.carLicensePlate.keyword': '1212',
      },
    });

    expect(Uri).toBe(`attributes.lead.carLicensePlate.keyword="1212"`);
  });
  it('should return correct formatted url if payment option is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      paymentOption: [
        {
          id: 1,
          title: 'Full payment',
          value: 'FULL_PAYMENT',
        },
        {
          id: 2,
          title: 'Installment',
          value: 'RABBIT_CARE_INSTALLMENT',
        },
        {
          id: 3,
          title: 'Credit card installment',
          value: 'CREDIT_CARD_INSTALLMENT',
        },
      ],
    });

    expect(Uri).toBe(
      `transaction.paymentOption.keyword in ("FULL_PAYMENT","RABBIT_CARE_INSTALLMENT","CREDIT_CARD_INSTALLMENT")`
    );
  });
  it('should return correct formatted url if payment status is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      paymentStatus: [
        {
          id: 4,
          title: 'Paid',
          value: 'SUCCESSFUL',
        },
        {
          id: 1,
          title: 'Pending',
          value: 'PENDING',
        },
        {
          id: 4,
          title: 'Overdue',
          value: 'OVERDUE',
        },
        {
          id: 4,
          title: 'Cancelled',
          value: 'CANCELLED',
        },
      ],
    });

    expect(Uri).toBe(
      `transaction.statusCode in ("SUCCESSFUL","PENDING","OVERDUE","CANCELLED")`
    );
  });
  it('should return correct formatted url if payment method is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      paymentMethod: [
        {
          id: 2,
          title: 'Cash',
          value: 'CASH',
        },
        {
          id: 2,
          title: 'PromptPay QR',
          value: 'QR_CODE',
        },
        {
          id: 1,
          title: 'Credit / Debit Card',
          value: 'ONLINECARD',
        },
        {
          id: 3,
          title: 'Direct payment',
          value: 'DIRECT_PAYMENT',
        },
        {
          id: 11,
          title: 'VEDC',
          value: 'VEDC',
        },
        {
          id: 10,
          title: 'Bank Transfer',
          value: 'BANK_TRANSFER',
        },
        {
          id: 8,
          title: 'EDC (Approval required)',
          value: 'EDC',
        },
      ],
    });

    expect(Uri).toBe(
      `latestCharge.paymentMethod.keyword in ("CASH","QR_CODE","ONLINECARD","DIRECT_PAYMENT","VEDC","BANK_TRANSFER","EDC")`
    );
  });
  it('should return correct formatted url if assigned user is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      salesAgents: [
        {
          name: 'users/1e1e2a61-b73b-43e9-a9f6-2e0319de3168',
          createTime: '2024-02-14T06:01:56.216673Z',
          updateTime: '2024-02-14T06:38:11.158141Z',
          deleteTime: null,
          createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
          humanId: 'carepayuat04@rabbit.co.th',
          role: 'roles/cash-installment-agent',
          firstName: 'Jeab (Payment)',
          lastName: 'Cash Installment Agent',
          annotations: {
            lang: 'TH',
          },
          loginTime: '2024-02-14T06:38:11.156798Z',
          title: 'Jeab (Payment) Cash Installment Agent',
          key: 'users/1e1e2a61-b73b-43e9-a9f6-2e0319de3168',
          id: 'users/1e1e2a61-b73b-43e9-a9f6-2e0319de3168',
          value: 'users/1e1e2a61-b73b-43e9-a9f6-2e0319de3168',
        },
      ],
    });

    expect(Uri).toBe(
      `followups[].assignment.name in ("users/1e1e2a61-b73b-43e9-a9f6-2e0319de3168")`
    );
  });
  it('should return correct formatted url if overdue date is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      overdue: [
        {
          id: 1,
          title: '1 - 7 days',
          value: {
            startDate: new Date('2024-03-05T03:10:27.610Z'),
            endDate: new Date('2024-03-12T03:10:27.611Z'),
          },
        },
        {
          id: 2,
          title: '8 - 19 days',
          value: {
            startDate: new Date('2024-02-22T03:10:27.611Z'),
            endDate: new Date('2024-03-04T03:10:27.611Z'),
          },
        },
      ],
    });

    expect(Uri).toBe(
      `followups[].followup.dueDate>='2024-03-05T03:10:27.610Z' followups[].followup.dueDate<='2024-03-12T03:10:27.611Z' followups[].followup.dueDate>='2024-02-22T03:10:27.611Z' followups[].followup.dueDate<='2024-03-04T03:10:27.611Z'`
    );
  });
  it('should return correct formatted url if create and update time are provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      date: {
        startDate: {
          range: {
            startDate: new Date('2024-03-10T19:00:00.000Z'),
            endDate: new Date('2024-03-11T18:59:59.999Z'),
          },
          criteria: 'followups[].dueDate',
        },
        endDate: {
          range: {
            startDate: new Date('2024-03-10T19:00:00.000Z'),
            endDate: new Date('2024-03-11T18:59:59.999Z'),
          },
          criteria: 'latestCharge.paymentDate',
        },
      },
    });

    expect(Uri).toBe(
      `followups[].dueDate>='2024-03-10T19:00:00.000Z' followups[].dueDate<='2024-03-11T18:59:59.999Z' latestCharge.paymentDate>='2024-03-10T19:00:00.000Z' latestCharge.paymentDate<='2024-03-11T18:59:59.999Z'`
    );
  });
  it('should return correct formatted url if show deleted is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
      showDeleted: true,
    });

    expect(Uri).toBe(` transaction.deleteTime!="0001-01-01T00:00:00Z"`);
  });
  it('should return empty url if nothing is provided', () => {
    const Uri = formatFilterURI({
      ...initialFilterValues,
    });

    expect(Uri).toBe(``);
  });
});
