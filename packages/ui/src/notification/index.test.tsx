import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { DateAsPerType, isNewLayout } from './helper';
import NotificationsList from './NotificationListTemplate';
import NotificationTemplate from './NotificationTemplate';
import { NotificationTypes, AttachedDocumentTypes } from './types';

import '@testing-library/jest-dom';

const mockCloseToast = jest.fn();
const mockNotificationTemplateData = {
  id: '10',
  title: 'Assigned Lead',
  details: {
    'Customer Name': 'ABC Customer',
    'Customer ID': 'LASJD1231231',
    customerName: 'test',
  },
  type: NotificationTypes.LEAD_ASSIGNMENT,
  date: '12/12/2020 (15:00)',
  description: 'demo description',
  url: 'lead/abc-lead',
};
const DemoNotificationList = {
  today: [
    {
      title: 'New Assignment Lead',
      date: 'Assigned on 12/12/1202',
      id: 'ABCD ID',
      name: 'ABC Customer',
      isNew: true,
      url: 'lead/ABC-Lead',
      inbox: true,
      type: NotificationTypes.LEAD_ASSIGNMENT,
      documentType: null,
      details: {
        leadId: 'DEMO NAME',
      },
      description: 'some subject',
    },
  ],
  older: [
    {
      title: 'New Assignment Lead',
      date: 'Assigned on 12/12/1202',
      id: 'ABCD ID',
      name: 'ABC Customer',
      isNew: true,
      inbox: true,
      url: null,
      type: NotificationTypes.LEAD_ASSIGNMENT,
      documentType: null,
      details: {
        leadId: 'DEMO NAME',
      },
      description: null,
    },
  ],
  total: 2,
  unRead: 2,
  token: 'demo_token',
};
const mockHandleRead = jest.fn();
const flags = {};

jest.useFakeTimers();
jest.setSystemTime(new Date('11/10/2022 (04:47:22 PM)').getTime());
describe('Testing Notification Tempalte', () => {
  it('should popup NotificationTemplate without optional data', () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationTemplateData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();

    expect(screen.getByTestId('notification-heading').innerHTML).toBe(
      'notification.leadAssignmentTitle - test'
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.leadAssignmentDate&nbsp;${mockNotificationTemplateData.date}`
    );
  });
  it('should popup NotificationTemplate with optional data', () => {
    global.open = jest.fn();

    const newMockData = {
      ...mockNotificationTemplateData,
      type: NotificationTypes.APPROVAL_REQUEST,
      description: 'demo description',
    };
    render(
      <NotificationTemplate
        toastProps={{
          data: newMockData,
        }}
        handleRead={mockHandleRead}
        closeToast={mockCloseToast}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();
  });
  it.skip('should trigger readNotification function', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationTemplateData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const redirectBtn = screen.getAllByTestId('notification-redirect-btn')[0];

    expect(redirectBtn).toBeInTheDocument();
    await userEvent.click(redirectBtn);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: '10',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
    expect(global.open).toHaveBeenCalled();
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it.skip('should not trigger readNotification function', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationTemplateData }}
        closeToast={mockCloseToast}
        flag={flags}
      />
    );
    const redirectBtn = screen.getAllByTestId('notification-redirect-btn')[0];

    expect(redirectBtn).toBeInTheDocument();
    await userEvent.click(redirectBtn);
    expect(global.open).toHaveBeenCalled();
  });
  it.skip('should not trigger readNotification function on close of notification', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationTemplateData }}
        closeToast={mockCloseToast}
        flag={flags}
      />
    );
    const closeBtn = screen.getAllByRole('button')[0];
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it.skip('should trigger readNotification function on close of notification', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationTemplateData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const closeBtn = screen.getAllByRole('button')[0];
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: '10',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it('should render notification template for appointment', () => {
    const newMockData = {
      ...mockNotificationTemplateData,
      type: NotificationTypes.APPOINTMENT,
    };
    render(
      <NotificationTemplate
        toastProps={{ data: newMockData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();
  });
  it('should render notification template for QC failed', () => {
    const newMockData = {
      ...mockNotificationTemplateData,
      type: NotificationTypes.QC_FAILED,
    };
    render(
      <NotificationTemplate
        toastProps={{ data: newMockData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();
  });
  it('should render notification template for document attached', () => {
    const newMockData = {
      ...mockNotificationTemplateData,
      type: NotificationTypes.DOCUMENT_ATTACHED,
    };
    render(
      <NotificationTemplate
        toastProps={{ data: newMockData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();
  });
  it('should render notification template for email replied', () => {
    const newMockData = {
      ...mockNotificationTemplateData,
      type: NotificationTypes.EMAIL_REPLIED,
    };
    render(
      <NotificationTemplate
        toastProps={{ data: newMockData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={flags}
      />
    );
    const notifTemplateDiv = screen.getByTestId('notification-template');
    expect(notifTemplateDiv).toBeInTheDocument();
  });
});

const mockNotificationData = {
  id: '1',
  title: 'Assigned Lead',
  details: { customerName: 'ABC Customer', leadId: 'L12345678' },
  type: NotificationTypes.LEAD_ASSIGNMENT,
  date: '12/12/2020 (15:00)',
  description: 'demo description',
  url: 'test/leadAssignment',
};

const newFlags = {
  isNewNotificationAppointment: true,
  isNewNotificationLeadAssignment: true,
  isNewNotificationDiscountRequest: true,
};
describe('Testing New Notification Template', () => {
  global.open = jest.fn();
  it('should popup new NotificationTemplate without LeadId', () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-heading').innerHTML).toContain(
      `notification.leadAssignmentTitle - ${mockNotificationData.details.customerName}`
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.leadAssignmentDate&nbsp;${mockNotificationData.date}`
    );
  });
  it('should popup new NotificationTemplate with LeadId', () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-leadId').innerHTML).toBe(
      ` (${mockNotificationData.details.leadId})`
    );
  });
  it.skip('should trigger readNotification function on redirection', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    const redirectBtn = screen.getByTestId('notification-redirect-btn');
    expect(redirectBtn).toBeInTheDocument();
    await userEvent.click(redirectBtn);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: '1',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
    expect(global.open).toHaveBeenCalled();
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it.skip('should not trigger readNotification function on redirection', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    const redirectBtn = screen.getByTestId('notification-redirect-btn');
    expect(redirectBtn).toBeInTheDocument();
    await userEvent.click(redirectBtn);
    expect(global.open).toHaveBeenCalled();
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it.skip('should trigger readNotification function on close of notification', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    const closeBtn = screen.getByTestId('notification-close-btn');
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: '1',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it.skip('should trigger not readNotification function on close of notification', async () => {
    render(
      <NotificationTemplate
        toastProps={{ data: mockNotificationData }}
        closeToast={mockCloseToast}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    const closeBtn = screen.getByTestId('notification-close-btn');
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(mockCloseToast).toHaveBeenCalled();
  });
  it('should render new notification template for type qc failed', () => {
    render(
      <NotificationTemplate
        toastProps={{
          data: {
            ...mockNotificationData,
            type: NotificationTypes.QC_FAILED,
            title: 'QC issue',
          },
        }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );
    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-heading').innerHTML).toContain(
      `notification.orderQcFailedTitle - ${mockNotificationData.details.customerName}`
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.orderQcFailedDate&nbsp;${mockNotificationData.date}`
    );
  });
  it('should render new notification template for type appointment', () => {
    render(
      <NotificationTemplate
        toastProps={{
          data: {
            ...mockNotificationData,
            type: NotificationTypes.APPOINTMENT,
          },
        }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );

    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-heading').innerHTML).toContain(
      `${mockNotificationData.description} notification.with ${mockNotificationData.details.customerName}`
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.appointmentDate&nbsp;${mockNotificationData.date}`
    );
  });
  it('should render new notification template for type document attached', () => {
    render(
      <NotificationTemplate
        toastProps={{
          data: {
            ...mockNotificationData,
            type: NotificationTypes.DOCUMENT_ATTACHED,
            title: 'ID Card',
            details: {
              ...mockNotificationData.details,
              documentType: AttachedDocumentTypes.DOCUMENT_TYPE_ID_CARD,
              leadId: 'L123123',
              customerName: 'Rikesh',
            },
          },
        }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );

    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-heading')).toHaveTextContent(
      'notification.titles.idCard notification.attached'
    );
    expect(screen.getByTestId('notification-leadId')).toHaveTextContent(
      '(L123123 - Rikesh)'
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.documentAddedDate&nbsp;${mockNotificationData.date}`
    );
  });
  it('should render new notification template for type email replied', () => {
    render(
      <NotificationTemplate
        toastProps={{
          data: {
            ...mockNotificationData,
            type: NotificationTypes.EMAIL_REPLIED,
            title: 'ID Card',
          },
        }}
        closeToast={mockCloseToast}
        handleRead={mockHandleRead}
        flag={newFlags}
      />
    );

    expect(screen.getByTestId('notification-template')).toBeInTheDocument();
    expect(screen.getByTestId('notification-heading').innerHTML).toContain(
      `notification.mailTitle - ${mockNotificationData.details.customerName}`
    );
    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      `notification.mailDate&nbsp;${mockNotificationData.date}`
    );
  });
});

const mockSetPageToken = jest.fn();
const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe.skip('Testing Notification List Template if handleRead func is there', () => {
  beforeEach(() => {
    render(
      <NotificationsList
        handleRead={mockHandleRead}
        data={DemoNotificationList}
        setPageToken={mockSetPageToken}
      />
    );
    expect(screen.getByTestId('notification-inbox')).toBeInTheDocument();
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
  it('should render list of notifications', async () => {
    await userEvent.click(screen.getAllByTestId('details-collapse-btn')[0]);
    expect(screen.getByTestId('notification-list')).toBeInTheDocument();
  });
  it('should trigger mark read function on click of a list of notifications', async () => {
    const list = screen.getAllByTestId('details-collapse-btn')[0];
    await userEvent.click(list);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: 'ABCD ID',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
  });
  it('should trigger mark read function on click of a redirect button', async () => {
    global.open = jest.fn();
    const list = screen.getAllByTestId('notification-redirect-btn')[0];
    await userEvent.click(list);
    expect(mockHandleRead).toHaveBeenCalledWith({
      notificationId: '10',
      readTime: '2022-11-10T00:00:00Z',
      type: NotificationTypes.LEAD_ASSIGNMENT,
    });
    expect(global.open).toHaveBeenCalledWith(
      DemoNotificationList.today[0].url,
      '_blank',
      'noopener'
    );
  });
  it('should save the token to state if click on Read More button', async () => {
    const readMoreBtn = screen.getByTestId('readmore-button');

    expect(readMoreBtn).toBeInTheDocument();
    await userEvent.click(readMoreBtn);
    expect(mockSetPageToken).toHaveBeenCalledWith('demo_token');
  });
});
describe.skip('Testing Notification List Template if handleRead func is not there', () => {
  it('should trigger mark read function on click of a redirect button', async () => {
    render(
      <NotificationsList
        data={DemoNotificationList}
        setPageToken={mockSetPageToken}
      />
    );

    expect(screen.getByTestId('notification-inbox')).toBeInTheDocument();

    global.open = jest.fn();
    const list = screen.getAllByTestId('notification-redirect-btn')[0];
    await userEvent.click(list);
    expect(global.open).toHaveBeenCalledWith(
      DemoNotificationList.today[0].url,
      '_blank',
      'noopener'
    );
  });
  it('should filter the unRead Notification on Toggle', async () => {
    const DemoNotificationList2 = {
      ...DemoNotificationList,
      older: [
        {
          title: 'New Assignment Lead',
          date: '12/12/1202',
          id: 'ABCD ID',
          name: 'ABC Customer',
          isNew: false,
          url: '',
          description: null,
          subject: null,
          inbox: true,
          type: NotificationTypes.LEAD_ASSIGNMENT,
          documentType: null,
          details: {
            leadId: 'DEMO NAME',
          },
        },
      ],
    };
    render(
      <NotificationsList
        setPageToken={mockSetPageToken}
        data={DemoNotificationList2}
      />
    );
    expect(screen.getByTestId('notification-inbox')).toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-switch-btn');

    await userEvent.click(toggleBtn);
    expect(screen.getAllByTestId('notification-list').length).toBe(1);
  });
  it('should filter the unRead Notification on Toggle', async () => {
    render(
      <NotificationsList
        setPageToken={mockSetPageToken}
        data={DemoNotificationList}
        flags={newFlags}
      />
    );
    expect(screen.getByTestId('notification-inbox')).toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-switch-btn');

    await userEvent.click(toggleBtn);
    expect(screen.getAllByTestId('notification-list').length).toBe(1);
  });
});

describe('Testing helpers', () => {
  it('should return date as per type of Lead Assign ', () => {
    render(
      <DateAsPerType
        type={NotificationTypes.LEAD_ASSIGNMENT}
        value="2022-01-01"
        className=""
      />
    );
    expect(screen.getByTestId('notification-date')).toHaveTextContent(
      'notification.leadAssignmentDate 2022-01-01'
    );
  });
  it('should return date as per type of Appointment ', () => {
    render(
      <DateAsPerType
        type={NotificationTypes.APPOINTMENT}
        value={null}
        className=""
        timeValues={{
          from: '2022-01-01T10:10:00Z',
          to: '2022-01-01T10:15:00Z',
        }}
      />
    );
    expect(screen.getByTestId('notification-date')).toHaveTextContent(
      'notification.appointmentDate 10:10 - 10:15 (5 notification.mins)'
    );
  });
  it('should return newLayout according to flag', () => {
    expect(isNewLayout(NotificationTypes.APPOINTMENT, flags)).toBe(true);
    expect(isNewLayout(NotificationTypes.APPOINTMENT, newFlags)).toBe(true);
    expect(isNewLayout(NotificationTypes.LEAD_ASSIGNMENT, flags)).toBe(true);
    expect(isNewLayout(NotificationTypes.LEAD_ASSIGNMENT, newFlags)).toBe(true);
    expect(isNewLayout(NotificationTypes.DOCUMENT_ATTACHED, newFlags)).toBe(
      true
    );
    expect(isNewLayout(NotificationTypes.DISCOUNT_REQUEST, newFlags)).toBe(
      true
    );
  });
});
