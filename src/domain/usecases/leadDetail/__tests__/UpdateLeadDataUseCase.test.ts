import UpdateLeadDataUseCase from '../UpdateLeadDataUseCase';

const mockedUpdateLead = jest.fn();
const mockedUpdateLeadData = jest.fn();

jest.mock('data/repository/leadDetail', () =>
  jest.fn(() => ({
    updateLead: mockedUpdateLead,
    updateLeadData: mockedUpdateLeadData,
  }))
);

describe('test for updateLeadDataUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('test if lead is updated normal patch', () => {
    new UpdateLeadDataUseCase().execute({
      leadId: 'leadid',
      important: true,
    });
    expect(mockedUpdateLeadData).toHaveBeenCalled();
    expect(mockedUpdateLead).not.toHaveBeenCalled();
  });

  it('test if lead data is updated with json patch', () => {
    new UpdateLeadDataUseCase().execute({
      leadId: 'leadid',
      body: [{ op: 'add', path: '/policyExpiryDate', value: '2020-02-02' }],
    });
    expect(mockedUpdateLead).toHaveBeenCalled();
    expect(mockedUpdateLeadData).not.toHaveBeenCalled();
  });
});
