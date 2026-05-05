import {
  CustomerProfileImportAction,
  getCustomerProfileImport,
  getCustomerProfileImportSuccess,
  getCustomerProfileImportFail,
} from '.';

const mockPayload = {
  fakeData: [],
};

describe('Customer Profile Actions', () => {
  it('Should dispatch get customer profile import action', () => {
    const action = {
      type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT,
      payload: mockPayload,
    };
    expect(getCustomerProfileImport(mockPayload)).toEqual(action);
  });

  it('Should dispatch get customer profile import success action', () => {
    const action = {
      type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_SUCCESS,
      payload: mockPayload,
    };
    expect(getCustomerProfileImportSuccess(mockPayload)).toEqual(action);
  });

  it('Should dispatch get customer profile import fail action', () => {
    const action = {
      type: CustomerProfileImportAction.GET_CUSTOMER_PROFILE_IMPORT_FAILED,
      payload: mockPayload,
    };
    expect(getCustomerProfileImportFail(mockPayload)).toEqual(action);
  });
});
