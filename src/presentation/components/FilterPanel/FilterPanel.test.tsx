import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';

import { server } from '__mocks__/server';
import { screen, render, waitFor } from '__tests__/rtl-test-utils';
import { MockInsurers } from 'mock-data/Insurers.mock';
import {
  getRoleAgent,
  getNotificationSuccess,
  getNotificationFailed,
  getAgentName,
  getPayloadAssign,
  getUsersByRole,
  getDisable,
  getDisableUnassign,
  typeOfAssign,
  assignTypeToRole,
} from 'presentation/components/FilterPanel/Filterpanel.helper';
import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import {
  INITIAL_VALUES,
  getFields,
} from 'presentation/pages/car-insurance/orders/filter.helper';
import { store } from 'presentation/redux/store';
import { getString } from 'presentation/theme/localization';
import { OrderType } from 'shared/constants/orderType';
import TeamRole from 'shared/constants/teamRole';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import {
  showRenderAgentName,
  RenderAgentName,
  findAgentNameFromUUID,
} from './RenderAgentName';

import Controls from '../controls/Control';

import FilterPanel from '.';

var mockAssignCacheUpdate: jest.Mock;

jest.mock(
  'presentation/components/controls/Slider',
  () =>
    // eslint-disable-next-line func-names
    function () {
      return <div>Slider Section</div>;
    }
);

jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useLazyGetAllUsersByStreamingQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: {
        users: [
          {
            name: 'users/2a8663fb-dad6-4dae-a710-a79f5dccfd41',
            createTime: '2023-01-01T23:09:15.047343Z',
            updateTime: '2023-01-01T23:09:22.129533Z',
            deleteTime: '2023-01-01T23:09:23.737987Z',
            createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
            humanId: '17399514127323678@cypress.co.th',
            role: 'roles/quality-control',
            firstName: 'CypressUpd',
            lastName: 'TestUpd',
            annotations: {
              lang: 'TH',
            },
            loginTime: null,
          },
          {
            name: 'users/0d8a70c6-90bc-440f-b8b4-82bd72742b90',
            createTime: '2022-12-29T23:10:14.248282Z',
            updateTime: '2022-12-29T23:10:25.938563Z',
            deleteTime: '2022-12-29T23:10:28.814491Z',
            createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
            humanId: '2179149854791092@cypress.co.th',
            role: 'roles/quality-control',
            firstName: 'Oriol',
            lastName: 'TestUpd',
            annotations: {
              lang: 'TH',
            },
            loginTime: null,
          },
        ],
        nextPageToken: '',
      },
    },
  ]),
  useLazyGetAllUserStreamingByLeadSearchQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: {
        users: [
          {
            name: 'users/dda8bc25-fd85-43f4-8623-09a6f7b73bea',
            firstName: 'Teetuch',
            lastName: 'Wongsaad',
            fullName: 'Teetuch Wongsaad',
            humanId: 'teetuchw@rabbit.co.th',
            role: 'roles/quality-control',
            loginTime: '2023-07-21T10:48:22.248197Z',
            createTime: '2022-01-07T12:41:01.042221Z',
            updateTime: '2023-07-21T10:48:22.249641Z',
            deleteTime: null,
            createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
            createByFirstName: 'Attila',
            createByLastName: 'Molnar',
            createByFullName: 'Attila Molnar',
            teamProduct: '',
            teamDisplayName: 'Cypress 19765162589917262',
            annotations: {},
          },
          {
            name: 'users/192dc955-5f7d-4b4d-8d4e-18a9327fd1bc',
            firstName: 'Atip',
            lastName: 'Makapong',
            fullName: 'Atip Makapong',
            humanId: 'atipm@rabbit.co.th',
            role: 'roles/quality-control',
            loginTime: '2022-12-20T09:21:21.208866Z',
            createTime: '2022-01-07T12:41:28.069256Z',
            updateTime: '2022-12-20T09:21:21.210085Z',
            deleteTime: null,
            createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
            createByFirstName: 'Attila',
            createByLastName: 'Molnar',
            createByFullName: 'Attila Molnar',
            teamProduct: '',
            teamDisplayName: 'Cypress 18460287505499803',
            annotations: {},
          },
        ],
        total: '',
      },
    },
  ]),
}));

jest.mock('data/slices/orderSlice', () => {
  mockAssignCacheUpdate = jest.fn();
  return {
    ...jest.requireActual('data/slices/orderSlice'),
    assignCacheUpdate: mockAssignCacheUpdate,
  };
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const mockDispatch = jest.fn();
(useDispatch as any).mockReturnValue(mockDispatch);

beforeEach(() => {
  server.use(
    http.post(getApiEndpoint(`/v1alpha1/orders/assign`, ServicesName.GFF), () =>
      HttpResponse.json({
        name: 'orders/6422ec6c-927e-4f97-b837-44333daac102',
        success: true,
        status: 200,
      })
    )
  );
});

test('render component FilterPanel view successfully', () => {
  const handleSubmit = jest.fn();
  const { getByTestId } = render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
      isOrderPage
      assignType={OrderType.All}
    />
  );
  expect(getByTestId('filter-panel')).toBeTruthy();
});

test('render component FilterPanel view successfully', () => {
  const handleSubmit = jest.fn();
  const setDirtyFilter = () => false;
  const { getByTestId } = render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
      isOrderPage
      assignType={OrderType.All}
      setDirtyFilter={setDirtyFilter}
    />
  );
  expect(getByTestId('filter-panel')).toBeTruthy();
});

test('render component RenderAgentName successfully', () => {
  const { getByTestId } = render(
    <Provider store={store as any}>
      <RenderAgentName />
    </Provider>
  );
  expect(getByTestId('agent-name')).toBeTruthy();
});

describe('Should assign to agent work', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockAssignCacheUpdate.mockClear();
  });
  const initialState = {
    selectionsReducer: {
      itemAssignToAgent: [{ id: '6422ec6c-927e-4f97-b837-44333daac102' }],
    },
    api: {},
  };
  test('Should assign to QC agent work', async () => {
    server.use(
      http.post(
        getApiEndpoint(`/v1alpha1/orders/assign`, ServicesName.GFF),
        () =>
          HttpResponse.json({
            name: 'orders/6422ec6c-927e-4f97-b837-44333daac102',
            success: true,
            status: 200,
          })
      )
    );
    render(<RenderAgentName assignType={OrderType.QC} />, { initialState });
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    let presentation = screen.getByRole('presentation');
    expect(presentation).toBeInTheDocument();

    const agentOptions = screen.getAllByRole('option');
    await userEvent.click(agentOptions[0]);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());

    const assignBtn = screen.getByTestId('assign-btn');
    expect(assignBtn).not.toBeDisabled();
    await userEvent.click(assignBtn);

    presentation = screen.getByRole('presentation');
    const modalConfirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(modalConfirmBtn);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());
    expect(presentation).not.toBeInTheDocument();
    expect(mockAssignCacheUpdate).toHaveBeenCalledWith({}, undefined, [
      'orders/6422ec6c-927e-4f97-b837-44333daac102',
    ]);
  });
  test('Should assign to Document agent work', async () => {
    server.use(
      http.post(
        getApiEndpoint(`/v1alpha1/orders/assign`, ServicesName.GFF),
        () =>
          HttpResponse.json({
            name: 'orders/6422ec6c-927e-4f97-b837-44333daac102',
            success: true,
            status: 200,
          })
      )
    );
    render(
      <RenderAgentName
        assignType={OrderType.Document}
        originalArgs={{
          params:
            'product=car-insurance&page_size=15&order_by=attributes.earliestPolicyStartDate desc',
          assignedTo: 'documentAgent',
        }}
      />,
      { initialState }
    );
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    let presentation = screen.getByRole('presentation');
    expect(presentation).toBeInTheDocument();

    const agentOptions = screen.getAllByRole('option');
    await userEvent.click(agentOptions[0]);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());

    const assignBtn = screen.getByTestId('assign-btn');
    expect(assignBtn).not.toBeDisabled();
    await userEvent.click(assignBtn);

    presentation = screen.getByRole('presentation');
    const modalConfirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(modalConfirmBtn);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());
    expect(presentation).not.toBeInTheDocument();
    expect(mockAssignCacheUpdate.mock.calls[0][0]).toMatchObject({
      assignedTo: 'documentAgent',
    });
    expect(mockAssignCacheUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ assignedTo: 'documentAgent' }),
      undefined,
      ['orders/6422ec6c-927e-4f97-b837-44333daac102']
    );
  });

  test('Should new assign to agent dropdown filter display', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/not-order-all',
      },
    });
    const handleSubmit = jest.fn();
    const setDirtyFilter = () => false;
    const isAdmin = true;
    const { getByTestId } = render(
      <FilterPanel
        fields={getFields({ teamRole: TeamRole.DocumentsCollection, isAdmin })}
        initialValues={INITIAL_VALUES}
        onSubmit={handleSubmit}
        isOrderPage
        assignType={OrderType.Document}
        noAgentAssignment={!isAdmin}
        setDirtyFilter={setDirtyFilter}
      />
    );
    expect(getByTestId('filter-panel')).toBeInTheDocument();
    expect(screen.getByText('text.assignedToUser')).toBeInTheDocument();
  });
});

test('get correct role agent', () => {
  const context = OrderType.QC;

  expect(getRoleAgent(context)).toEqual(TeamRole.QualityControl);

  expect(getRoleAgent(OrderType.Submission)).toEqual(TeamRole.QualityControl);
});

test('get agent name', () => {
  const status = TypeAssign.UNASSIGN;
  const agentName = '';

  expect(getAgentName(status, agentName)).toEqual('');
});

test('get notification success', () => {
  const status = TypeAssign.ASSIGN;

  expect(getNotificationSuccess(status)).toEqual(
    getString('text.assignedOrderSuccess')
  );
});

test('get notification success with another status', () => {
  const status = TypeAssign.UNASSIGN;

  expect(getNotificationSuccess(status)).toEqual(
    getString('text.unassignedOrderSuccess')
  );
});

test('get notification failed', () => {
  const status = TypeAssign.ASSIGN;

  expect(getNotificationFailed(status)).toEqual(
    getString('text.assignedOrderFailed')
  );
});

test('get notification failed with another status', () => {
  const status = TypeAssign.UNASSIGN;

  expect(getNotificationFailed(status)).toEqual(
    getString('text.unassignedOrderFailed')
  );
});

test('assigning order to agent 1st', () => {
  const orderList = [
    '26b00184-3f6c-4407-ab43-3eac6add13c5',
    'f51ec5ea-1460-4807-ab04-68160af288a7',
  ];
  const status = 'ASSIGN';
  const agentName = 'users/811420b4-5b14-4995-8eaa-9456c887c183';
  const assignType = OrderType.Document;

  expect(getPayloadAssign(orderList, status, agentName, assignType)).toEqual({
    body: {
      resources: [
        'orders/26b00184-3f6c-4407-ab43-3eac6add13c5',
        'orders/f51ec5ea-1460-4807-ab04-68160af288a7',
      ],
      assignedTo: 'users/811420b4-5b14-4995-8eaa-9456c887c183',
    },
    assignType: 'DOCUMENT',
  });
});

test('assigning order to agent 2nd', () => {
  const orderList = '';
  const status = 'ASSIGN';
  const agentName = 'users/811420b4-5b14-4995-8eaa-9456c887c183';
  const assignType = OrderType.Document;

  expect(getPayloadAssign(orderList, status, agentName, assignType)).toEqual({
    body: {
      resources: '',
      assignedTo: 'users/811420b4-5b14-4995-8eaa-9456c887c183',
    },
    assignType: 'DOCUMENT',
  });
});

test('assigning order to agent 3rd', () => {
  const orderList = [
    'orders/9785b01d-4182-4fef-ac85-f4fe4c7fa5e1/items/b90fc742-f7f6-46f2-bdfd-6617bdc54b7b',
  ];
  const status = 'ASSIGN';
  const agentName = 'users/811420b4-5b14-4995-8eaa-9456c887c183';
  const assignType = OrderType.Submission;

  expect(getPayloadAssign(orderList, status, agentName, assignType)).toEqual({
    body: {
      resources: [
        'orders/9785b01d-4182-4fef-ac85-f4fe4c7fa5e1/items/b90fc742-f7f6-46f2-bdfd-6617bdc54b7b',
      ],
      assignedTo: 'users/811420b4-5b14-4995-8eaa-9456c887c183',
    },
    assignType: 'SUBMISSION',
  });
});

test('assigning order to agent 4th', () => {
  const orderList = null;
  const status = 'ASSIGN';
  const agentName = 'users/811420b4-5b14-4995-8eaa-9456c887c183';
  const assignType = OrderType.Document;

  expect(getPayloadAssign(orderList, status, agentName, assignType)).toEqual({
    body: {
      resources: null,
      assignedTo: 'users/811420b4-5b14-4995-8eaa-9456c887c183',
    },
    assignType: 'DOCUMENT',
  });
});

test('check reset button filter panel', () => {
  const handleSubmit = jest.fn();

  render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId('reset-btn').closest('button')).toHaveAttribute(
    'disabled'
  );
});

test('check assign button filter panel', () => {
  const { getByTestId } = render(
    <Provider store={store as any}>
      <RenderAgentName />
    </Provider>
  );

  expect(getByTestId('assign-btn').closest('button')).toHaveAttribute(
    'disabled'
  );

  expect(getByTestId('unassign-btn').closest('button')).toHaveAttribute(
    'disabled'
  );
});

test('check get user', () => {
  const listUsers = [
    { key: 'users/99d3685d-6931-4f08-9c75-203308549f0c', value: 'A A' },
  ];
  expect(getUsersByRole(listUsers)).toEqual([
    {
      key: 'users/99d3685d-6931-4f08-9c75-203308549f0c',
      value: 'A A',
      title: 'A A',
    },
  ]);
});

test('render insurer autocomplete list asynchronously', async () => {
  const handleSubmit = jest.fn();
  server.use(
    http.get(`${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`, () =>
      HttpResponse.json(MockInsurers)
    )
  );
  render(
    <FilterPanel
      onSubmit={handleSubmit}
      initialValues={INITIAL_VALUES}
      fields={getFields({})}
    />
  );

  const select = await screen.findAllByPlaceholderText('text.select');
  await userEvent.click(select[2]);

  const option = await screen.findByText('FPG Insurance');
  expect(option).toBeInTheDocument();
});

test('check get user with empty input', () => {
  expect(getUsersByRole(null)).toEqual([]);
});

test('render collapse button successfully', async () => {
  const handleSubmit = jest.fn();
  const { getByTestId } = render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
    />
  );
  await userEvent.click(getByTestId('collapse-button'));
});

test('check showRenderAgentName run well within conditions', () => {
  expect(showRenderAgentName(true, OrderType.Approval)).toEqual(
    <RenderAgentName assignType={OrderType.Approval} />
  );
});

test('check showRenderAgentName run well outside conditions', () => {
  expect(showRenderAgentName(false, OrderType.All)).toEqual('');
});

test('check getDisable run well within conditions', () => {
  expect(getDisable('Duy Nguyen', [])).toEqual(true);
});

test('check getDisable run well outside conditions', () => {
  expect(getDisable('', ['Duy Nguyen'])).toEqual(true);
});

test('check getDisableUnassign run well 1st', () => {
  expect(getDisableUnassign([])).toEqual(true);
});

test('check getDisableUnassign run well 2nd', () => {
  expect(getDisableUnassign([{ assignedTo: '' }])).toEqual(true);
});

test('check getDisableUnassign run well 3rd', () => {
  expect(
    getDisableUnassign([{ assignedTo: '' }, { assignedTo: 'Tri' }])
  ).toEqual(false);
});

test('check findAgentNameFromUUID run well 1st', () => {
  expect(
    findAgentNameFromUUID(
      '1',
      'ASSIGN',
      ['1', '2'].map((num: string) => ({
        title: num,
        key: num,
        value: num,
      }))
    )
  ).toEqual('1');
});

test('check findAgentNameFromUUID run well 2nd', () => {
  expect(
    findAgentNameFromUUID(
      '0',
      'ASSIGN',
      ['1', '2'].map((num: string) => ({
        title: num,
        key: num,
        value: num,
      }))
    )
  ).toEqual('');
});

test('check findAgentNameFromUUID run well 3rd', () => {
  expect(
    findAgentNameFromUUID(
      '0',
      'UNASSIGN',
      ['1', '2'].map((num: string) => ({
        title: num,
        key: num,
        value: num,
      }))
    )
  ).toEqual('');
});

test('check findAgentNameFromUUID run well 4th', () => {
  expect(
    findAgentNameFromUUID(
      '0',
      '',
      ['1', '2'].map((num: string) => ({
        title: num,
        key: num,
        value: num,
      }))
    )
  ).toEqual('');
});

test('check findAgentNameFromUUID run well 4th', () => {
  expect(findAgentNameFromUUID('0', '', [])).toEqual('');
});

test('check submit button filter panel', () => {
  const handleSubmit = jest.fn();

  render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId('submit-btn').closest('button')).toHaveAttribute(
    'disabled'
  );
});

test('render <FilterPanel /> with show all checkbox', async () => {
  const handleSubmit = jest.fn();
  const mockCheck = false;
  const mockCheckFn = jest.fn();
  render(
    <FilterPanel
      fields={getFields({})}
      initialValues={INITIAL_VALUES}
      onSubmit={handleSubmit}
      isAllRequests={mockCheck}
      onAllRequests={mockCheckFn}
      showAllRequestCheckbox
    />
  );

  const showAllCheckbox = document.getElementsByName('myLead.showAll')[0];
  await userEvent.click(showAllCheckbox as HTMLElement);
});
test('render <FilterPanel /> with checkbox', async () => {
  const handleSubmit = jest.fn();
  render(
    <FilterPanel
      fields={[
        {
          InputComponent: Controls.Checkbox,
          inputProps: {
            name: 'showDeleted',
            label: getString('carepay.transaction.showDeleted'),
            filterType: 'detail',
            fixedLabel: true,
            responsive: {
              xs: 6,
              md: 3,
            },
          },
        },
      ]}
      initialValues={{ showDeleted: false }}
      onSubmit={handleSubmit}
    />
  );

  const checkbox = document.getElementsByName('showDeleted')[0];
  expect(checkbox).toBeInTheDocument();
  await userEvent.click(checkbox as unknown as HTMLElement);
});

describe('Test typeAssign helper', () => {
  it('Should type order', () => {
    expect(typeOfAssign('/orders/qc')).toBe('order');
    expect(typeOfAssign('/orders/documents')).toBe('order');
  });

  it('Should type policy', () => {
    expect(typeOfAssign('/orders/approval')).toBe('policy');
    expect(typeOfAssign('/orders/submission')).toBe('policy');
  });

  it('Should assignTypeToRole work as expected', () => {
    const typeAndResponse = [
      [
        OrderType.Document,
        [TeamRole.DocumentsCollection, TeamRole.QualityControl],
      ],
      [OrderType.QC, TeamRole.QualityControl],
      [OrderType.Submission, [TeamRole.Submission, TeamRole.QualityControl]],
      [OrderType.Approval, TeamRole.ProblemCase],
    ];
    typeAndResponse.forEach(([type, response]) => {
      expect(assignTypeToRole(type as OrderType)).toEqual(response);
    });
  });
});

describe('<RenderAgentName/> dispatch assignCacheUpdate with correct payload at policies level', () => {
  const initialState = {
    selectionsReducer: {
      itemAssignToAgent: [{ id: '6422ec6c-927e-4f97-b837-44333daac102' }],
    },
    api: {},
  };
  const originalArgs = {
    params:
      'product=car-insurance&page_size=15&order_by=attributes.earliestPolicyStartDate desc',
    assignedTo: 'approvalAgent',
  };
  test('<RenderAgentName/> with Approval order type', async () => {
    render(
      <RenderAgentName
        assignType={OrderType.Approval}
        originalArgs={originalArgs}
      />,
      { initialState }
    );
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    let presentation = screen.getByRole('presentation');
    await waitFor(() => {
      expect(presentation).toBeInTheDocument();
    });
    const agentOptions = screen.getAllByRole('option');
    await userEvent.click(agentOptions[0]);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());

    const assignBtn = screen.getByTestId('assign-btn');
    await userEvent.click(assignBtn);

    presentation = screen.getByRole('presentation');
    const modalConfirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(modalConfirmBtn);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());
    expect(presentation).not.toBeInTheDocument();
    expect(mockAssignCacheUpdate).toHaveBeenCalledWith(
      originalArgs,
      undefined,
      ['6422ec6c-927e-4f97-b837-44333daac102'],
      true
    );
  });
  test('<RenderAgentName/> with Submission order type', async () => {
    render(<RenderAgentName assignType={OrderType.Submission} />, {
      initialState,
    });
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);

    let presentation = screen.getByRole('presentation');
    expect(presentation).toBeInTheDocument();

    const agentOptions = screen.getAllByRole('option');
    await userEvent.click(agentOptions[0]);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());

    const assignBtn = screen.getByTestId('assign-btn');
    await userEvent.click(assignBtn);

    presentation = screen.getByRole('presentation');
    const modalConfirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(modalConfirmBtn);
    await waitFor(() => expect(presentation).not.toBeInTheDocument());
    expect(presentation).not.toBeInTheDocument();
    expect(mockAssignCacheUpdate).toHaveBeenCalledWith(
      {},
      undefined,
      ['6422ec6c-927e-4f97-b837-44333daac102'],
      true
    );
  });
});
