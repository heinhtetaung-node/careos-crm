import ChargesResponse from '@alphafounders/mock-data/json/chargesSearch.json';
import leadSearchResponse from '@alphafounders/mock-data/json/leadSearchApiMock.json';
import TeamsResponse from '@alphafounders/mock-data/json/teamListGenericSearch.json';
import TransactionSearchResponse from '@alphafounders/mock-data/json/transactionSearch.json';
import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';
import { NewDateFormatters } from 'shared/helper/utilities';
import getApiEndpoint from 'utils/endpointHelper';

import { getProductType } from './helper';

import {
  useLazySearchLeadQuery,
  useLazyGenericSearchQuery,
  useGetAllUsersQuery,
  useGenericSearchQuery,
} from '.';

describe.skip('leadSearch', () => {
  beforeEach(() => {
    server.use(
      http.get(getApiEndpoint('api/lead-search/v1alpha1/search'), () =>
        HttpResponse.json(leadSearchResponse.leadSearchResponse)
      ),
      http.get(
        getApiEndpoint(
          'api/lead/v1alpha2/leads/3b22cf09-9749-455b-aad3-531574983a5f/comments/0d593c26-55d3-4702-baac-222c337e623e'
        ),
        () => HttpResponse.json(leadSearchResponse.commentResponse)
      )
    );
  });

  test('should call api and format the result', async () => {
    const { result } = renderHook(() => useLazySearchLeadQuery());
    await (result.current as any)[0]({ withRejectionComment: false });
    expect((result.current as any)[1].data).toEqual(
      leadSearchResponse.formattedResponseWithoutRejectionComment
    );
  });

  test('should call comment service to get comment if withRejetion comment is true', async () => {
    const { result } = renderHook(() => useLazySearchLeadQuery());
    await (result.current as any)[0]({ withRejectionComment: true });
    expect((result.current as any)[1].data).toEqual(
      leadSearchResponse.formattedResponseWithRejectionComment
    );
  });

  test('Api fail case', async () => {
    server.use(
      http.get(getApiEndpoint('/api/lead-search/v1alpha1/search'), () =>
        HttpResponse.json(null, { status: 500 })
      )
    );
    const { result } = renderHook(() => useLazySearchLeadQuery());
    await (result.current as any)[0]({ withRejectionComment: false });
    expect((result.current as any)[1].error).toStrictEqual({
      status: 500,
      data: null,
    });
  });
});

describe.skip('leadSearch', () => {
  const { DDMMYYYY } = NewDateFormatters();

  const formattedTeamData = {
    teams: TeamsResponse.teams.map((team: any) => ({
      ...team,
      productName: getProductType(team?.productType),
      updateTime: DDMMYYYY(team.updateTime),
      createTime: DDMMYYYY(team.createTime),
    })),
    total: TeamsResponse.total,
  };
  const formattedChargesData = {
    imports: [
      {
        ciTeam: '-',
        createDate: '11/12/2023',
        customerName: 'Pactum Testing',
        customerPhone: '+66999999999',
        dueDate: '06/01/2024',
        id: 'L9908475',
        installment: 1,
        paymentDate: '07/12/2023',
        license: '33ย-3234 กท',
        paymentChannel: 'OMISE',
        paymentType: 'FULL_PAYMENT',
        status: 'SUCCESSFUL',
      },
    ],
    total: 1,
  };

  it('calls teams api and returns formatted data', async () => {
    server.use(
      http.get(getApiEndpoint('api/lead-search/v1alpha1/search/teams'), (_) =>
        HttpResponse.json(TeamsResponse)
      )
    );

    const { result } = renderHook(() => useLazyGenericSearchQuery());
    await (result.current as any)[0]({
      queryParams: {
        currentPage: 1,
        filter: '',
        orderBy: 'team.createTime desc',
        pageSize: 15,
        pageToken: '',
        showDeleted: true,
        type: 'teams',
      },
      tableType: 'team',
    });
    expect((result.current as any)[1].data).toEqual(formattedTeamData);
  });
  it('calls charges api and returns formatted data', async () => {
    server.use(
      http.get(
        getApiEndpoint('api/lead-search/v1alpha1/search/followups'),
        (_) => HttpResponse.json(ChargesResponse)
      )
    );

    const { result } = renderHook(() => useLazyGenericSearchQuery());
    await (result.current as any)[0]({
      queryParams: {
        currentPage: 1,
        filter: '',
        orderBy: '',
        pageSize: 15,
        pageToken: '',
        showDeleted: true,
        type: 'followups',
      },
      tableType: 'allCarePay',
    });
    expect((result.current as any)[1].data).toEqual(formattedChargesData);
  });
});

describe.skip('getAllUser', () => {
  it('should call the api until it fetch all users', async () => {
    server.use(
      http.get(getApiEndpoint('api/lead-search/v1alpha1/search/users'), () =>
        HttpResponse.json({
          users: ['user1', 'user2'],
          total: 2,
        })
      )
    );
    const { result } = renderHook(useGetAllUsersQuery);

    await waitFor(() => expect((result.current as any).isLoading).toBeFalsy());

    expect((result.current as any).data).toStrictEqual(['user1', 'user2']);
  });
});

const formattedTransactionResponse = {
  imports: [
    {
      accountRecipient: '-',
      amount: '26,149.31',
      childItems: [],
      ciTeam: '-',
      configId: 'transactions/0be04bcf-84d6-42e8-9d7f-4925b531efe1',
      createDate: '15/01/2024',
      customerName: 'Test Test',
      customerPhone: '+66999999999',
      dueDate: '-',
      id: 'L9909216',
      isNotSelectable: true,
      license: 'redplate',
      overdue: '-',
      paymentChannel: '-',
      paymentDate: '',
      paymentStatus: 'PENDING',
      paymentType: 'menu.carePay.paymentType.installment.main',
    },
  ],
  total: 1,
};

describe('Testing Search API', () => {
  it('should call the api until it fetch all transactions', async () => {
    server.use(
      http.get(
        getApiEndpoint('api/lead-search/v1alpha1/search/transactions'),
        () =>
          HttpResponse.json({
            transactions: [
              TransactionSearchResponse,
              {
                ...TransactionSearchResponse,
                followups: [
                  {
                    followup: {
                      name: 'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/420555a2-1839-4a2e-abef-8e6ee4f86e1a',
                      createTime: '2024-03-14T09:39:34.726610111Z',
                      updateTime: '2024-03-14T09:39:34.726610182Z',
                      deleteTime: null,
                      dueDate: '2024-05-14T00:00:00Z',
                      sendSms: true,
                      status: 'FOLLOWUP_STATUS_PENDING',
                      charge: '',
                      installment: 3,
                    },
                    assignment: null,
                    attributes: {
                      assignment: null,
                    },
                  },
                  {
                    followup: {
                      name: 'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/13ba76c6-341d-4357-afa7-752e18afcc69',
                      createTime: '2024-03-14T09:39:17.572888Z',
                      updateTime: '2024-03-14T09:39:35.096577Z',
                      deleteTime: null,
                      dueDate: '2024-03-14T16:59:59Z',
                      sendSms: true,
                      status: 'FOLLOWUP_STATUS_PAID',
                      charge:
                        'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/charges/04719287-eccf-448f-88fa-7f5359640729',
                      installment: 1,
                    },
                    assignment: null,
                    attributes: {
                      assignment: null,
                    },
                  },
                  {
                    followup: {
                      name: 'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/69f3f42f-a65e-42b5-9ee1-036da5f02503',
                      createTime: '2024-03-14T09:39:34.726608Z',
                      updateTime: '2024-03-14T10:51:55.413783Z',
                      deleteTime: null,
                      dueDate: '2024-04-14T00:00:00Z',
                      sendSms: true,
                      status: 'FOLLOWUP_STATUS_PAID',
                      charge:
                        'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/charges/ca4b7fd8-3320-40b2-b3ad-ce2c27b3fcca',
                      installment: 2,
                    },
                    assignment: null,
                    attributes: {
                      assignment: null,
                    },
                  },
                ],
              },
            ],
            total: 2,
          })
      )
    );
    const { result } = renderHook(() =>
      useGenericSearchQuery({
        queryParams: {
          currentPage: 1,
          filter: '',
          orderBy: 'team.createTime desc',
          pageSize: 15,
          type: 'transactions',
        },
        tableType: 'carePayTransaction',
      })
    );

    await waitFor(() => expect((result.current as any).isLoading).toBeFalsy());

    expect((result.current as any).data).toMatchObject({
      imports: [
        formattedTransactionResponse.imports[0],
        {
          ...formattedTransactionResponse.imports[0],
          isNotSelectable: false,
          childItems: [
            {
              id: 'L9909216',
              assignment: null,
              childId:
                'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/13ba76c6-341d-4357-afa7-752e18afcc69',
              installment: 1,
              amount: 'menu.carePay.waitingForOpenLink',
              paymentStatus: 'PAID',
              paymentMethod: '-',
              paymentDate: '',
              assignedToUser: '-',
              dueDate: '14/03/2024',
              createDate: '14/03/2024',
              updateDate: '14/03/2024',
              sendSms: true,
              shouldAskForSlip: false,
              transactionSlipData: {},
              isDeleted: false,
            },
            {
              id: 'L9909216',
              assignment: null,
              childId:
                'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/69f3f42f-a65e-42b5-9ee1-036da5f02503',
              installment: 2,
              amount: 'menu.carePay.waitingForOpenLink',
              paymentStatus: 'PAID',
              paymentMethod: '-',
              paymentDate: '',
              assignedToUser: '-',
              dueDate: '14/04/2024',
              createDate: '14/03/2024',
              updateDate: '14/03/2024',
              sendSms: true,
              shouldAskForSlip: false,
              transactionSlipData: {},
              isDeleted: false,
            },
            {
              id: 'L9909216',
              assignment: null,
              childId:
                'transactions/a894af8e-91e8-4dc0-841d-d7b5af8cd468/followups/420555a2-1839-4a2e-abef-8e6ee4f86e1a',
              installment: 3,
              amount: 'menu.carePay.waitingForOpenLink',
              paymentStatus: 'PENDING',
              paymentMethod: '-',
              paymentDate: '',
              assignedToUser: '-',
              dueDate: '14/05/2024',
              createDate: '14/03/2024',
              updateDate: '14/03/2024',
              sendSms: true,
              shouldAskForSlip: true,
              transactionSlipData: {},
              isDeleted: false,
            },
          ],
        },
      ],
      total: 2,
    });
  });
});
