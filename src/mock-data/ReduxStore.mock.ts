const initialState = {
  leadsDetailReducer: {
    updateLeadImportantReducer: {
      isFetching: false,
      hasError: false,
      success: true,
      payload: {
        data: 'test',
      },
    },
    callReducer: {
      data: {},
    },
    lead: {
      payload: {
        important: true,
        data: {
          customerPhoneNumber: [
            {
              phone: '+66999999999',
              status: 'unverified',
            },
            {
              phone: '+66877777777',
              status: 'unverified',
            },
          ],
          primaryPhoneIndex: 1,
        },
      },
    },
    smsReducer: {
      isFetching: true,
    },
    emailReducer: {
      data: {
        loading: false,
        emails: [
          {
            bodyText: 'Testind email',
            emailAddress: 'dummy@test.com',
            body: '',
            createTime: new Date(),
            cc: [],
          },
          {
            bodyText: 'Testind 2email',
            emailAddress: 'dummy2@test.com',
            body: '',
            createTime: new Date(),
            cc: [],
          },
        ],
        fileUploadUrl: '',
        unReadMails: 0,
      },
      isFetching: false,
      success: true,
      status: '',
      actionType: '',
    },
  },
  documentReducer: {
    data: {
      data: {
        document: {
          name: 'test',
        },
      },
    },
  },
  orderCommentReducer: {
    comments: [],
    nextPageToken: '',
    isCommentCreating: false,
    isFetching: false,
    error: '',
  },
  orderUploadDocumentReducer: {
    documents: [],
  },
  order: {
    isFetching: false,
    hasError: false,
    success: true,
    payload: {
      lead: 'leads/7d4485a2-e44d-437c-8cd9-b74df8080ae9',
      data: 'test',
    },
  },
};

const stateOrderFetching = {
  ...initialState,
  order: {
    ...initialState.order,
    isFetching: true,
  },
};

export { initialState, stateOrderFetching };
