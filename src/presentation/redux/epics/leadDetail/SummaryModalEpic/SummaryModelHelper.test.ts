import { updateLeadPolicyExpiryAPI } from './helper';

const mockedExecuteFunc = jest.fn();

jest.mock('domain/usecases/leadDetail', () => ({
  UpdateLeadDataUseCase: jest.fn(() => ({
    execute: mockedExecuteFunc,
  })),
}));

it('test updateLeadPolicyExpiry function', () => {
  updateLeadPolicyExpiryAPI({
    leadId: 'leadid',
    policyExpiryDate: '2022-02-02',
  });
  expect(mockedExecuteFunc).toHaveBeenCalled();
  expect(mockedExecuteFunc.mock.calls[0][0]).toStrictEqual({
    leadId: 'leadid',
    body: [{ op: 'add', path: '/policyExpiryDate', value: '2022-02-02' }],
  });
});
