import { NotificationTypes } from '@alphafounders/ui';
import {
  renderHook,
  render,
  screen,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFlags } from 'flagsmith/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { of } from 'rxjs';

import { setupApiStore } from '__tests__/rtl-store';
import WebSocketGateway from 'data/gateway/websocket';
import { apiSlice } from 'data/slices/apiSlice';
import useNotification from 'presentation/hooks/useNotification';
import DemoNotificationList from 'shared/helper/notification.mock';

import { MergeAndUpdateData } from './helper';

const mockUseFlags = useFlags as jest.Mock;

const mockNotificationTemplateData = {
  id: '10',
  name: 'name',
  title: 'Assigned Lead',
  type: NotificationTypes.LEAD_ASSIGNMENT,
  details: {
    customerName: 'LASJD1231231',
  },
  description: null,
  subject: null,
  date: 'Assigned on 12/12/2020 (15:00)',
  url: 'lead/Lead-ID',
};

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue({
    name: '-',
  }),
}));

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(),
}));

const currentFlags = {};

jest.mock('data/slices/notificationSlice', () => ({
  ...jest.requireActual('data/slices/notificationSlice'),
  useGetNotificationListQuery: jest.fn().mockReturnValue({
    data: {
      older: [],
      today: [
        {
          title: 'New Assignment Lead',
          date: 'Assigned on 12/12/1202',
          id: 'ABCD ID',
          name: 'ABC Customer',
          isNew: true,
          url: '',
          inbox: true,
          payload: {
            'Customer Name': 'LASJD1231231',
          },
          type: 'types/leadAssignment',
        },
      ],
      total: 1,
    },
    refetch: jest.fn(),
  }),
}));

const mockedWebSocketGateway = jest.mocked(WebSocketGateway);

mockedWebSocketGateway.getInstance = jest.fn().mockReturnValue({
  subscribe: jest.fn().mockReturnValue(
    of({
      body: mockNotificationTemplateData,
    })
  ),
  unsubscribe: jest.fn(),
});

describe('Testing Notification', () => {
  beforeEach(() => {
    mockUseFlags.mockReturnValue(currentFlags);
  });
  it('should call useNotifcation hook', async () => {
    const { result } = renderHook(
      () =>
        useNotification({
          userId: null,
          config: { position: 'top-left', limit: 1, autoClose: 100 },
        }),
      {
        wrapper,
      }
    );
    const { addNotification, NotificationContainer, NotificationList } =
      result.current;

    render(NotificationContainer);
    await act(async () => {
      addNotification({ data: mockNotificationTemplateData });
    });
    expect(document.getElementsByClassName('Toastify')[0]).toBeInTheDocument();

    render(NotificationList);
    const inboxTriggerBtn = screen.getByTestId('notification-inbox-trigger');
    expect(inboxTriggerBtn).toBeInTheDocument();
  });

  it('should not call notification pop over if FF is off', async () => {
    const { result } = renderHook(
      () =>
        useNotification({
          userId: null,
          config: { position: 'top-left', limit: 1, autoClose: 100 },
        }),
      {
        wrapper,
      }
    );
    const { addNotification } = result.current;

    await act(async () => {
      addNotification({
        data: {
          ...mockNotificationTemplateData,
          type: NotificationTypes.APPROVAL_REQUEST,
        },
      });
    });
    expect(document.getElementsByClassName('Toastify')[0]).toBe(undefined);

    await act(async () => {
      addNotification({
        data: {
          ...mockNotificationTemplateData,
          type: NotificationTypes.CONTRACT_SIGNED,
        },
      });
    });
    expect(document.getElementsByClassName('Toastify')[0]).toBe(undefined);
  });

  it('should hid the notification inbox if clicked outside the box', () => {
    const { result } = renderHook(
      () =>
        useNotification({
          userId: '-',
          config: { position: 'top-left', limit: 1, autoClose: 100 },
        }),
      {
        wrapper,
      }
    );
    const { NotificationList } = result.current;

    render(NotificationList);
    const inboxTriggerBtn = screen.getByTestId('notification-inbox-trigger');
    expect(inboxTriggerBtn).toBeInTheDocument();

    userEvent.click(inboxTriggerBtn);
    waitFor(() => {
      expect(screen.getByTestId('notification-inbox')).toBeInTheDocument();
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    userEvent.click(inboxTriggerBtn.parentElement!);

    expect(screen.queryByTestId('notification-inbox')).not.toBeInTheDocument();
  });
});

describe('Testing Helpers', () => {
  const mockHandleListUpdate = jest.fn();
  const mockSetNotification = jest.fn();
  const flags = {
    isNewNotificationAppointment: true,
    isNewNotificationLeadAssignment: true,
    isNewNotificationQcFailed: true,
    isNewNotificationDocumentAttached: true,
    isNewNotificationEmailReplied: true,
    isNewNotificationContractSigned: true,
  };

  it('should call MergeAndUpdateData and should not merged data', () => {
    MergeAndUpdateData(
      DemoNotificationList,
      DemoNotificationList,
      mockSetNotification,
      mockHandleListUpdate,
      false,
      flags,
      false
    );

    const updatedList = {
      today: [...DemoNotificationList.today],
      older: [...DemoNotificationList.older],
      token: 'test',
      total: 2,
      unRead: 1,
    };

    expect(mockHandleListUpdate).toHaveBeenCalledWith(updatedList);
    expect(mockSetNotification).toHaveBeenCalledWith(true);
  });
  it('should call MergeAndUpdateData and should not merged data', () => {
    MergeAndUpdateData(
      DemoNotificationList,
      DemoNotificationList,
      mockSetNotification,
      mockHandleListUpdate,
      true,
      flags,
      false
    );
    const updatedList = {
      today: [...DemoNotificationList.today],
      older: [...DemoNotificationList.older],
      token: 'test',
      total: 2,
      unRead: 1,
    };

    expect(mockHandleListUpdate).toHaveBeenCalledWith(updatedList);
    expect(mockSetNotification).toHaveBeenCalledWith(true);
  });
  it('should call MergeAndUpdateData and should not merged data with prev token', () => {
    MergeAndUpdateData(
      { ...DemoNotificationList, token: 'demo-token' },
      { ...DemoNotificationList, token: '' },
      mockSetNotification,
      mockHandleListUpdate,
      true,
      flags,
      true
    );
    const updatedList = {
      today: [...DemoNotificationList.today],
      older: [...DemoNotificationList.older],
      token: 'test',
      total: 4,
      unRead: 1,
    };

    expect(mockHandleListUpdate).toHaveBeenCalledWith(updatedList);
    expect(mockSetNotification).toHaveBeenCalledWith(true);
  });
  it.todo('should not popover if readTime is not null');
  it.todo('should not popover if deleteTime is not null');
});
