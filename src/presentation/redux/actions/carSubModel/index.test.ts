import {
  CarSubModelImportAction,
  getCarSubModelImport,
  getCarSubModelImportSuccess,
  getCarSubModelImportFail,
} from '.';

const mockPayload = {
  fakeData: [],
};

describe('Car sub model Actions', () => {
  it('Should dispatch getCarSubModelImport action', () => {
    const action = {
      type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT,
      payload: mockPayload,
    };
    expect(getCarSubModelImport(mockPayload)).toEqual(action);
  });

  it('Should dispatch get car sub model import success action', () => {
    const action = {
      type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_SUCCESS,
      payload: mockPayload,
    };
    expect(getCarSubModelImportSuccess(mockPayload)).toEqual(action);
  });

  it('Should dispatch get car sub model import fail action', () => {
    const action = {
      type: CarSubModelImportAction.GET_CAR_SUB_MODEL_IMPORT_FAILED,
      payload: mockPayload,
    };
    expect(getCarSubModelImportFail(mockPayload)).toEqual(action);
  });
});
