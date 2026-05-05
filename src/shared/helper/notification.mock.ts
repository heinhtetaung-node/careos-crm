import { NotificationTypes } from '@alphafounders/ui';

const DemoNotificationList = {
  today: [
    {
      title: 'New Assignment Lead',
      date: 'Assigned on 12/12/1202',
      id: 'ABCD ID',
      name: 'ABC Customer',
      isNew: true,
      inbox: true,
      url: null,
      description: null,
      subject: null,
      details: {
        customerName: 'LASJD1231231',
      },
      type: NotificationTypes.LEAD_ASSIGNMENT,
    },
  ],
  older: [
    {
      title: 'Payment Follow up',
      date: 'Assigned on 12/12/2022',
      id: 'ABCD ID',
      name: 'ABC Customer',
      isNew: false,
      inbox: true,
      type: NotificationTypes.LEAD_ASSIGNMENT,
      url: null,
      description: null,
      subject: null,
      details: {},
    },
  ],
  total: 2,
  unRead: 1,
  token: 'test',
};

export default DemoNotificationList;
