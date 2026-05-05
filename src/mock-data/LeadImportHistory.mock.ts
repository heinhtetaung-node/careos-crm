const LeadHistory = {
  imports: [
    {
      name: 'imports/b8608316-e87b-4b6e-8b36-ade7b85cac3b',
      sequenceNumber: 1487,
      product: 'products/car-insurance',
      imported: '1',
      status: 'COMPLETE',
      errors: [],
      createTime: '2022-06-06T05:30:20.987474Z',
      updateTime: '2022-06-06T05:30:22.630347Z',
      createBy: 'users/fakeUserId',
      importType: 'LEAD',
      leadDetails: {
        source: 'sources/83b143ce-d318-4051-82f3-bc5aeddf16d2',
      },
      filename: 'A lead-import_2022_06_06-2022_06_06_05_30_20.csv',
      sheetsId: '',
    },
    {
      name: 'imports/09afd502-8ee4-4a99-8861-55fc6a14ae9c',
      sequenceNumber: 1345,
      product: 'products/car-insurance',
      imported: '0',
      status: 'ERROR',
      errors: [
        {
          rowNumber: 1,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
        {
          rowNumber: 2,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
        {
          rowNumber: 3,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
        {
          rowNumber: 4,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
        {
          rowNumber: 5,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
        {
          rowNumber: 6,
          fieldName: 'Phone',
          errorCode: 'INVALID',
          message: 'invalid phone',
        },
      ],
      createTime: '2022-05-09T07:44:32.199152Z',
      updateTime: '2022-05-09T07:44:34.052808Z',
      createBy: 'users/fakeUserId',
      importType: 'LEAD',
      leadDetails: {
        source: 'sources/8a9f789d-750c-4af4-b8a5-5a9984c51f66',
      },
      filename: 'test import lead-2022_05_09_07_44_32.csv',
      sheetsId: '',
    },
  ],
  nextPageToken: '',
};

export default LeadHistory;
