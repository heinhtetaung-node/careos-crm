import getFormatterFunction, {
  customImportedStatus,
  formatImportedCustomerHistory,
  formattedCarImportHistory,
  formatImportedPackageHistory,
  formattedLeadHistory,
  formatImportedCuratedCarHistory,
} from './helper';

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

describe('Test formatImportedHistory', () => {
  beforeEach(() => {
    process.env.VITE_API_ENDPOINT = 'http://localhost:4432';
  });

  const mockedListimported = [
    {
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
      createTime: '',
      errors: [],
      filename: 'Test-2021_11_02_07_31_00.csv',
      importType: 'CUSTOMER',
      imported: '6',
      name: 'imports/28146b4b-42b1-41c7-9a08-efa19895abb5',
      product: 'products/car-insurance',
      sequenceNumber: 1175,
      status: 'importFileStatus.complete',
      updateTime: '',
    },
    {
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      createTime: '',
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
      status: 'importFileStatus.error',
      updateTime: '',
    },
    {
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      createTime: '',
      errors: [],
      filename: 'Test-2021_11_02_06_25_57.csv',
      importType: 'CUSTOMER',
      imported: '4',
      name: 'imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294',
      product: 'products/car-insurance',
      sequenceNumber: 1173,
      status: 'importFileStatus.complete',
      updateTime: '',
    },
    {
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
      createTime: '',
      errors: [],
      filename: 'Test-2021_11_01_09_39_17.csv',
      importType: 'CUSTOMER',
      imported: '80',
      name: 'imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb',
      product: 'products/car-insurance',
      sequenceNumber: 1172,
      status: 'importFileStatus.complete',
      updateTime: '',
    },
    {
      createBy: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
      createTime: '',
      errors: [],
      filename: 'Test-2021_11_01_08_47_02.csv',
      importType: 'CUSTOMER',
      imported: '1000',
      name: 'imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d',
      packageDetails: { packageType: 'RENEWAL' },
      product: 'products/car-insurance',
      sequenceNumber: 1171,
      status: 'importFileStatus.complete',
      updateTime: '',
      autoassignDetails: {
        effectiveDate: '12/12/2022T00:00:00',
      },
    },
  ];

  const expectedCustomerResult = [
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/28146b4b-42b1-41c7-9a08-efa19895abb5:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_02_07_31_00.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
      imported: '6',
      updateTime: '',
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
      createTime: '',
      filename: 'Test-2021_11_02_06_39_07.csv',
      status: 'importFileStatus.error',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      imported: '0',
      updateTime: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_02_06_25_57.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      imported: '4',
      updateTime: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_01_09_39_17.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
      imported: '80',
      updateTime: '',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_01_08_47_02.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
      imported: '1000',
      updateTime: '',
      effectiveDate: '',
    },
  ];

  const expectedCarDiscountResult = [
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/28146b4b-42b1-41c7-9a08-efa19895abb5:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_02_07_31_00.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
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
      createTime: '',
      filename: 'Test-2021_11_02_06_39_07.csv',
      status: 'importFileStatus.error',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_02_06_25_57.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_01_09_39_17.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d:generateDownloadUrl',
      errors: [],
      createTime: '',
      filename: 'Test-2021_11_01_08_47_02.csv',
      status: 'importFileStatus.complete',
      createBy: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
    },
  ];

  const expectedLeadResult = [
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/28146b4b-42b1-41c7-9a08-efa19895abb5:generateDownloadUrl',
      errors: [],
      createTime: '',
      product: 'Car Insurance',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c591',
      imported: '6',
      sequenceNumber: 1175,
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
      createTime: '',
      product: 'Car Insurance',
      status: 'importFileStatus.error',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      imported: '0',
      sequenceNumber: 1174,
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/1d789d54-dbc0-4c38-b9fb-e5fa2a65f294:generateDownloadUrl',
      errors: [],
      createTime: '',
      product: 'Car Insurance',
      status: 'importFileStatus.complete',
      createBy: 'users/c1fd229c-95b7-41cf-94a8-c59d0c0311b4',
      imported: '4',
      sequenceNumber: 1173,
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/7125220f-88e7-4687-b5b5-dc8eff4ac1fb:generateDownloadUrl',
      errors: [],
      createTime: '',
      product: 'Car Insurance',
      status: 'importFileStatus.complete',
      createBy: 'users/c230e49f-5de0-46d9-9f11-5f078ad2c592',
      imported: '80',
      sequenceNumber: 1172,
    },
    {
      downloadLink:
        'http://localhost:4432/api/lead-import/v1alpha1/imports/9babb7f0-dea1-47c8-aab0-469fbe3a3c9d:generateDownloadUrl',
      errors: [],
      createTime: '',
      product: 'Car Insurance',
      status: 'importFileStatus.complete',
      createBy: 'users/b55459ce-d402-4197-88e7-3de01971f4da',
      imported: '1000',
      sequenceNumber: 1171,
    },
  ];

  it('Should return expected result when passed with Customer List', () => {
    const formatCustomerImportedHistoryResult =
      formatImportedCustomerHistory(mockedListimported);

    expect(formatCustomerImportedHistoryResult).toEqual(expectedCustomerResult);
  });

  it('Should return expected result when passed with CarDiscount List', () => {
    const formatCarDiscountImportedHistoryResult =
      formattedCarImportHistory(mockedListimported);

    expect(formatCarDiscountImportedHistoryResult).toEqual(
      expectedCarDiscountResult
    );
  });

  it('Should return expected result when passed with Lead List', () => {
    const formatLeadImportedHistoryResult =
      formattedLeadHistory(mockedListimported);

    expect(formatLeadImportedHistoryResult).toEqual(expectedLeadResult);
  });
});

describe('getFormatterFunction', () => {
  it('returns formatImportedPackageHistory function when trying to format package type', () => {
    expect(getFormatterFunction('package')).toEqual(
      formatImportedPackageHistory
    );
  });

  it('returns formattedLeadHistory function when trying to format leads type', () => {
    expect(getFormatterFunction('leads')).toEqual(formattedLeadHistory);
  });

  it('returns formattedCarImportHistory function when trying to format carSubModel type', () => {
    expect(getFormatterFunction('carSubModel')).toEqual(
      formattedCarImportHistory
    );
  });

  it('returns formattedCarImportHistory function when trying to format redbook type', () => {
    expect(getFormatterFunction('redbook')).toEqual(formattedCarImportHistory);
  });
  it('returns formatImportedCustomerHistory function when trying to format autoAssignImport type', () => {
    expect(getFormatterFunction('autoAssignImport')).toEqual(
      formatImportedCustomerHistory
    );
    expect(getFormatterFunction('customerProfile')).toEqual(
      formatImportedCustomerHistory
    );
  });
});

describe('formatImportedPackageHistory', () => {
  const fakePackageImportAPIResponse = [
    {
      name: 'imports/fakeName',
      sequenceNumber: 1,
      imported: '100',
      status: 'importFileStatus.complete',
      createTime: '',
      createBy: 'users/fakeUserId',
      errors: [],
      filename: 'fakeFileName.csv',
      packageDetails: {
        packageType: 'RENEWAL',
      },
    },
    {
      name: 'imports/anotherFakeName',
      sequenceNumber: 2,
      imported: '200',
      status: 'importFileStatus.error',
      createTime: '',
      createBy: 'users/anotherfakeUserId',
      errors: [
        {
          rowNumber: 2,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 3',
        },
      ],
      filename: 'anotherFakeFileName.csv',
      packageDetails: {
        packageType: 'STANDARD',
      },
    },
  ];

  it('returns package import data in correct format', () => {
    expect(formatImportedPackageHistory(fakePackageImportAPIResponse)).toEqual([
      {
        createBy: 'users/fakeUserId',
        createTime: '',
        downloadLink: `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports/fakeName:generateDownloadUrl`,
        errors: [],
        filename: 'fakeFileName.csv',
        id: 1,
        imported: '100',
        packageType: 'RENEWAL',
        status: 'importFileStatus.complete',
      },
      {
        createBy: 'users/anotherfakeUserId',
        createTime: '',
        downloadLink: `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports/anotherFakeName:generateDownloadUrl`,
        errors: [
          {
            errorCode: 'INVALID',
            fieldName: '',
            message: 'invalid data type on column: 3',
            rowNumber: 2,
          },
        ],
        filename: 'anotherFakeFileName.csv',
        id: 2,
        imported: '200',
        packageType: 'STANDARD',
        status: 'importFileStatus.error',
      },
    ]);
  });
});

describe('formatImportedCuratedCarHistory', () => {
  const fakeImportedCuratedCarAPIResponse = [
    {
      name: 'imports/fakeName',
      sequenceNumber: 1,
      status: 'importFileStatus.complete',
      createTime: '',
      createBy: 'users/fakeUserId',
      errors: [],
      filename: 'fakeFileName.csv',
    },
    {
      name: 'imports/anotherFakeName',
      sequenceNumber: 2,
      status: 'importFileStatus.error',
      createTime: '',
      createBy: 'users/anotherfakeUserId',
      errors: [
        {
          rowNumber: 2,
          fieldName: '',
          errorCode: 'INVALID',
          message: 'invalid data type on column: 3',
        },
      ],
      filename: 'anotherFakeFileName.csv',
    },
  ];

  it('returns formatImportedCuratedCarHistory function when trying to format curatedCar type', () => {
    expect(getFormatterFunction('curatedCar')).toEqual(
      formatImportedCuratedCarHistory
    );
  });

  it('returns curated car import data in correct format', () => {
    expect(
      formatImportedCuratedCarHistory(fakeImportedCuratedCarAPIResponse)
    ).toEqual([
      {
        createBy: 'users/fakeUserId',
        createTime: '',
        downloadLink: `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports/fakeName:generateDownloadUrl`,
        errors: [],
        filename: 'fakeFileName.csv',
        id: 1,
        status: 'importFileStatus.complete',
      },
      {
        createBy: 'users/anotherfakeUserId',
        createTime: '',
        downloadLink: `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports/anotherFakeName:generateDownloadUrl`,
        errors: [
          {
            errorCode: 'INVALID',
            fieldName: '',
            message: 'invalid data type on column: 3',
            rowNumber: 2,
          },
        ],
        filename: 'anotherFakeFileName.csv',
        id: 2,
        status: 'importFileStatus.error',
      },
    ]);
  });
});
