import { UnknownAction } from 'redux';

import reducer from './reducer';

const mockPayload = {
  orderId: 'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df',
  items: [
    'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca7531f7',
  ],
  insurers: ['The Viriyah Insurance Company Limited'],
  approvalStatuses: ['APPROVED'],
  noOfPolicies: 1,
};

const mockPayloadDifferent = {
  orderId: 'orders/2a03d612-11e4-4336-a4f8-da871306507d',
  items: [
    'orders/2a03d612-11e4-4336-a4f8-da871306507d/items/9aa56da6-7faa-45d7-8bd0-31c339b82918',
  ],
  insurers: ['Bangkok Insurance Public Company Limited'],
  approvalStatuses: ['PENDING'],
  noOfPolicies: 2,
};

describe('Test selected policies', () => {
  test('Should handle initial state', () => {
    expect(reducer(undefined, {} as UnknownAction)).toStrictEqual({
      selectedPolicies: [],
      itemAssignToAgent: [],
    });
  });

  test('Should add more policy', () => {
    const initialState = {
      selectedPolicies: [mockPayload],
      itemAssignToAgent: [],
    };

    const state = reducer(initialState, {
      type: 'selectionsSlice/addSelected',
      payload: {
        ...mockPayload,
        items: [
          'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca753999',
        ],
      },
    });

    expect(state).toEqual({
      selectedPolicies: [
        {
          ...mockPayload,
          approvalStatuses: ['APPROVED', 'APPROVED'],
          insurers: [
            'The Viriyah Insurance Company Limited',
            'The Viriyah Insurance Company Limited',
          ],
          items: [
            'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca7531f7',
            'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca753999',
          ],
        },
      ],
      itemAssignToAgent: [],
    });
  });

  test('Should reducer remove 1 policy', () => {
    const initialState = {
      selectedPolicies: [
        {
          ...mockPayload,
          approvalStatuses: ['APPROVED', 'APPROVED'],
          insurers: [
            'The Viriyah Insurance Company Limited',
            'The Viriyah Insurance Company Limited',
          ],
          items: [
            'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca7531f7',
            'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca753999',
          ],
        },
      ],
      itemAssignToAgent: [],
    };

    const state = reducer(initialState, {
      type: 'selectionsSlice/addSelected',
      payload: {
        ...mockPayload,
        items: [
          'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca753999',
        ],
      },
    });

    expect(state).toEqual({
      selectedPolicies: [mockPayload],
      itemAssignToAgent: [],
    });
  });

  test('Should reducer remove whole item', () => {
    const initialState = {
      selectedPolicies: [mockPayload],
      itemAssignToAgent: [],
    };

    const state = reducer(initialState, {
      type: 'selectionsSlice/addSelected',
      payload: {
        ...mockPayload,
        items: [
          'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca7531f7',
        ],
      },
    });
    expect(state).toEqual({
      selectedPolicies: [],
      itemAssignToAgent: [],
    });
  });

  test('Should reducer add different policy', () => {
    const initialState = {
      selectedPolicies: [mockPayload],
      itemAssignToAgent: [],
    };
    const state = reducer(initialState, {
      type: 'selectionsSlice/addSelected',
      payload: mockPayloadDifferent,
    });
    expect(state).toEqual({
      selectedPolicies: [mockPayload, mockPayloadDifferent],
      itemAssignToAgent: [],
    });
  });

  test('Should clear all policy', () => {
    const initialState = {
      selectedPolicies: [mockPayload],
      itemAssignToAgent: [],
    };
    const state = reducer(initialState, {
      type: 'selectionsSlice/clearSelected',
      payload: mockPayloadDifferent,
    });
    expect(state).toEqual({
      selectedPolicies: [],
      itemAssignToAgent: [],
    });
  });
});

describe('Test item assign to agents', () => {
  const itemId =
    'orders/1c69a6fb-90d2-46be-ac6c-19d7b8ba54df/items/a3007047-7e83-4e13-80da-e1f7ca753999';
  test('Should add item assign', () => {
    const initialState = {
      selectedPolicies: [],
      itemAssignToAgent: [],
    };

    const state = reducer(initialState, {
      type: 'selectionsSlice/addItemAssign',
      payload: {
        id: itemId,
      },
    });

    expect(state).toMatchObject({
      itemAssignToAgent: [
        {
          id: itemId,
        },
      ],
    });
  });
  test('Should remove item assign if exists', () => {
    const initialState = {
      selectedPolicies: [],
      itemAssignToAgent: [{ id: itemId }],
    };

    const state = reducer(initialState, {
      type: 'selectionsSlice/addItemAssign',
      payload: {
        id: itemId,
      },
    });

    expect(state).toMatchObject({
      itemAssignToAgent: [],
    });
  });
});
