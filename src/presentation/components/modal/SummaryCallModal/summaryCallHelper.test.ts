import {
  callSummaryValidation,
  getAppointmentListOptions,
  policyEndDateRequiredRejectionReason,
} from './summaryCall.helper';

describe('SummaryCallHelper', () => {
  const fakeAppointments = [
    {
      name: 'fakeName',
      startTime: '2024-03-04T18:24:00Z',
      status: '',
    },
    {
      name: 'fakeName2',
      startTime: '2024-03-04T17:54:00Z',
      status: '',
    },
    {
      name: 'fakeName3',
      startTime: '2024-03-04T19:79:00Z',
      status: 'CALLED',
    },
  ];

  it('should return appointment list options and filter called appointments', () => {
    const result = getAppointmentListOptions(fakeAppointments);
    expect(result).toEqual([
      { id: 'fakeName', title: '06:24', value: 'fakeName' },
      { id: 'fakeName2', title: '05:54', value: 'fakeName2' },
    ]);
  });

  it('should include only configured reasons for showing policy expiry date', () => {
    expect(policyEndDateRequiredRejectionReason).toContain('blacklist_ci');
    expect(policyEndDateRequiredRejectionReason).not.toContain(
      'cancelled_before_renewal'
    );
  });

  it('should keep policyExpiryDate optional for configured rejection reasons', async () => {
    const schema = callSummaryValidation();
    await expect(
      schema.validate({
        comment: 'comment',
        status: 'LEAD_STATUS_NEW',
        isRejected: true,
        reason: 'already_purchased',
        policyExpiryDate: undefined,
      })
    ).resolves.toBeTruthy();
  });
});
