import listImportCustomerProfileReducer, {
  customImportedStatus,
  formatCustomerProfileImportedHistory,
} from '.';

describe('Test customerImportedStatus', () => {
  it('Should be "importFileStatus.inProgress" if "IN_PROGESS" is passed', () => {
    expect(customImportedStatus('IN_PROGRESS')).toEqual(
      'importFileStatus.inProgress'
    );
  });

  it('Should be "importFileStatus.complete" if "COMPLETE" is passed', () => {
    expect(customImportedStatus('COMPLETE')).toEqual(
      'importFileStatus.complete'
    );
  });

  it('Should be "importFileStatus.error" if "ERROR" is passed', () => {
    expect(customImportedStatus('ERROR')).toEqual('importFileStatus.error');
  });

  it('Should be empty string if anything other than IN_PROGESS, COMPLETE, ERROR is passed', () => {
    expect(customImportedStatus('PENDING')).toEqual('');
  });
});

describe('Test formatCustomerImportedHistory', () => {
  beforeEach(() => {
    process.env.VITE_API_ENDPOINT = 'http://localhost:4432';
  });

  const mockedListimportedCustomers = [
    {
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
      // createTime: '2021-11-01T08:48:12.921563Z',
      errors: [],
      filename: 'Test-2021_11_02_07_31_00.csv',
      importType: 'CUSTOMER',
      imported: '6',
      name: 'imports/28146b4b-42b1-41c7-9a08-efa19895abb5',
      product: 'products/car-insurance',
      sequenceNumber: 1175,
      status: 'COMPLETE',
      // updateTime: '2021-11-01T08:48:12.921563Z',
    },
    {
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      // createTime: '2021-11-01T08:48:12.921563Z',
      errors: [
        {
          rowNumber: 2,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 49',
        },
        {
          rowNumber: 3,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 49',
        },
        {
          rowNumber: 4,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 49',
        },
        {
          rowNumber: 5,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 49',
        },
      ],
      filename: 'Test-2021_11_02_06_39_07.csv',
      importType: 'CUSTOMER',
      imported: '0',
      name: 'imports/b4483ad1-a14d-4f78-a698-a19ce00db69d',
      packageDetails: { packageType: 'RENEWAL' },
      product: 'products/car-insurance',
      sequenceNumber: 1174,
      status: 'ERROR',
      // updateTime: '2021-11-01T08:48:12.921563Z',
    },
    {
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      // createTime: '2021-11-01T08:48:12.921563Z',
      errors: [],
      filename: 'Test-2021_11_02_06_25_57.csv',
      importType: 'CUSTOMER',
      imported: '4',
      name: 'imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294',
      product: 'products/car-insurance',
      sequenceNumber: 1173,
      status: 'COMPLETE',
      // updateTime: '2021-11-01T08:48:12.921563Z',
    },
    {
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
      // createTime: '2021-11-01T08:48:12.921563Z',
      errors: [],
      filename: 'Test-2021_11_01_09_39_17.csv',
      importType: 'CUSTOMER',
      imported: '80',
      name: 'imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb',
      product: 'products/car-insurance',
      sequenceNumber: 1172,
      status: 'COMPLETE',
      // updateTime: '2021-11-01T08:48:12.921563Z',
    },
    {
      createBy: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
      // createTime: '2021-11-01T08:48:12.921563Z',
      errors: [],
      filename: 'Test-2021_11_01_08_47_02.csv',
      importType: 'CUSTOMER',
      imported: '1000',
      name: 'imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d',
      packageDetails: { packageType: 'RENEWAL' },
      product: 'products/car-insurance',
      sequenceNumber: 1171,
      status: 'COMPLETE',
      // updateTime: '2021-11-01T08:48:12.921563Z',
    },
  ];

  const mockedUserList = [
    {
      key: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
      value: 'Haaku Kaale',
    },
    {
      key: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      value: 'Kaale Haaku',
    },
    {
      key: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
      value: 'Agent 007',
    },
    {
      key: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
      value: 'James Bond',
    },
  ];

  const expectedResult = [
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/28146b4b-42b1-41c7-9a08-efa19895abb5:generateDownloadUrl',
      errors: [],
      id: 'imports/28146b4b-42b1-41c7-9a08-efa19895abb5',
      importDate: '',
      importFileName: 'Test-2021_11_02_07_31_00.csv',
      importStatus: 'importFileStatus.complete',
      importedBy: 'Haaku Kaale',
      importedRows: '6',
      lastDate: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/b4483ad1-a14d-4f78-a698-a19ce00db69d:generateDownloadUrl',
      errors: [
        {
          errorCode: 'INVALID',
          fieldName: '',
          message: 'invalid data type on column: 49',
          rowNumber: 2,
        },
        {
          errorCode: 'INVALID',
          fieldName: '',
          message: 'invalid data type on column: 49',
          rowNumber: 3,
        },
        {
          errorCode: 'INVALID',
          fieldName: '',
          message: 'invalid data type on column: 49',
          rowNumber: 4,
        },
        {
          errorCode: 'INVALID',
          fieldName: '',
          message: 'invalid data type on column: 49',
          rowNumber: 5,
        },
      ],
      id: 'imports/b4483ad1-a14d-4f78-a698-a19ce00db69d',
      importDate: '',
      importFileName: 'Test-2021_11_02_06_39_07.csv',
      importStatus: 'importFileStatus.error',
      importedBy: 'Kaale Haaku',
      importedRows: '0',
      lastDate: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294:generateDownloadUrl',
      errors: [],
      id: 'imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294',
      importDate: '',
      importFileName: 'Test-2021_11_02_06_25_57.csv',
      importStatus: 'importFileStatus.complete',
      importedBy: 'Kaale Haaku',
      importedRows: '4',
      lastDate: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb:generateDownloadUrl',
      errors: [],
      id: 'imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb',
      importDate: '',
      importFileName: 'Test-2021_11_01_09_39_17.csv',
      importStatus: 'importFileStatus.complete',
      importedBy: 'Agent 007',
      importedRows: '80',
      lastDate: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d:generateDownloadUrl',
      errors: [],
      id: 'imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d',
      importDate: '',
      importFileName: 'Test-2021_11_01_08_47_02.csv',
      importStatus: 'importFileStatus.complete',
      importedBy: 'James Bond',
      importedRows: '1000',
      lastDate: '',
    },
  ];

  it('Should return expected result when passed with Customers and user list', () => {
    const formatCustomerImportedHistoryResult =
      formatCustomerProfileImportedHistory(
        mockedListimportedCustomers,
        mockedUserList
      );

    expect(formatCustomerImportedHistoryResult).toEqual(expectedResult);
  });
});

describe('Test listImportCustomerProfileReducer', () => {
  const initialState = {
    data: [],
    isFetching: false,
    success: true,
    status: '',
    actionType: '',
    pageToken: '',
    listPageToken: [],
    pageIndex: 0,
    pageSize: 0,
    orderBy: [],
    showDeleted: false,
    filter: '',
  };

  it('Should return correct response when action type is "[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT"', () => {
    const mockedAction = {
      type: '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT',
      payload: {
        currentPage: 1,
        pageToken: '',
        pageSize: 15,
        orderBy: '',
        showDeleted: true,
        filter: '',
      },
    };

    const response = listImportCustomerProfileReducer(
      initialState,
      mockedAction
    );

    expect(response).toEqual({
      actionType: '',
      data: [],
      filter: '',
      isFetching: true,
      listPageToken: [
        {
          page: 1,
          token: '',
        },
      ],
      orderBy: '',
      pageIndex: 1,
      pageSize: 15,
      pageToken: '',
      showDeleted: true,
      status: '',
      success: true,
    });
    expect(response.isFetching).toEqual(true);
  });

  it('Should return correct response when action type is "[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_SUCCESS"', () => {
    const mockedAction = {
      type: '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_SUCCESS',
      payload: {
        currentPage: 1,
        pageToken: '',
        pageSize: 15,
        orderBy: '',
        showDeleted: true,
        filter: '',
      },
    };

    const response = listImportCustomerProfileReducer(
      initialState,
      mockedAction
    );

    expect(response).toEqual({
      actionType: '',
      data: [],
      filter: '',
      isFetching: false,
      listPageToken: [],
      orderBy: [],
      pageIndex: 0,
      pageSize: 0,
      pageToken: '',
      showDeleted: false,
      status: '',
      success: true,
    });
    expect(response.isFetching).toEqual(false);
  });

  it('Should return correct response when action type is "[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_FAILED"', () => {
    const mockedAction = {
      type: '[CustomerProfile] GET_CUSTOMER_PROFILE_IMPORT_FAILED',
      payload: {
        currentPage: 1,
        pageToken: '',
        pageSize: 15,
        orderBy: '',
        showDeleted: true,
        filter: '',
      },
    };

    const response = listImportCustomerProfileReducer(
      initialState,
      mockedAction
    );

    expect(response).toEqual({
      actionType: '',
      data: [],
      filter: '',
      isFetching: false,
      listPageToken: [],
      orderBy: [],
      pageIndex: 0,
      pageSize: 0,
      pageToken: '',
      showDeleted: false,
      status: '',
      success: false,
    });
    expect(response.isFetching).toEqual(false);
  });
});
