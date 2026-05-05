import { screen, render } from '@testing-library/react';
import React from 'react';

import {
  CalenderIcon,
  ArrowRightCircleIcon,
  DocumentIcon,
  EmailIcon,
} from '@alphafounders/icons';

import {
  DateAsPerType,
  getDiscountApprovalTitle,
  GetDocumentTitle,
  IconAsPerType,
  TitleAsPerType,
} from './helper';
import {
  AttachedDocumentTypes,
  DiscountRequestTypes,
  NotificationTypes,
} from './types';

jest.mock('Context/useUIContext', () => {
  return jest.fn().mockImplementation(() => ({
    t: (key: AttachedDocumentTypes) => key,
  }));
});

describe('Testing function to get document Title', () => {
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(
        AttachedDocumentTypes.DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENSE
      )
    ).toBe(
      'notification.titles.firstNamedDrivingLicense notification.attached'
    );
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(
        AttachedDocumentTypes.DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENSE
      )
    ).toBe(
      'notification.titles.secondNamedDrivingLicense notification.attached'
    );
  });
  it('should return the correct title as per type', () => {
    expect(GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_ID_CARD)).toBe(
      'notification.titles.idCard notification.attached'
    );
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_PAYMENT_SLIP)
    ).toBe('notification.titles.paymentSlip notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_OTHERS)).toBe(
      'notification.titles.otherDocument notification.attached'
    );
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(
        AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_DASHCAM_PICTURE
      )
    ).toBe('notification.titles.vehicleDashcamPicture notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_BACK)
    ).toBe('notification.titles.vehicleBackPicture notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(
        AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_FRONT
      )
    ).toBe('notification.titles.vehicleFrontPicture notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_LEFT)
    ).toBe('notification.titles.vehicleLeftPicture notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(
        AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_PICTURE_RIGHT
      )
    ).toBe('notification.titles.vehicleRightPicture notification.attached');
  });
  it('should return the correct title as per type', () => {
    expect(
      GetDocumentTitle(AttachedDocumentTypes.DOCUMENT_TYPE_VEHICLE_REGISTRATION)
    ).toBe('notification.titles.vehicleRegistration notification.attached');
  });
  it('should return null if there isnt any type', () => {
    expect(GetDocumentTitle('')).toBeNull();
  });
});
describe('Testing GetDiscountRequestTitle function', () => {
  it('should return correct title as per given type', () => {
    expect(getDiscountApprovalTitle(DiscountRequestTypes.APPROVED)).toBe(
      'discountRequestApproved'
    );
  });
  it('should return correct title as per given type', () => {
    expect(getDiscountApprovalTitle(DiscountRequestTypes.REJECTED)).toBe(
      'discountRequestRejected'
    );
  });
});

describe('Testing TitleAsPerType functions', () => {
  it('should return correct title as per type', () => {
    render(
      TitleAsPerType({
        type: NotificationTypes.DOCUMENT_ATTACHED,
        description: '',
        details: {
          documentType: AttachedDocumentTypes.DOCUMENT_TYPE_ID_CARD,
          customerName: 'Hxn',
          leadId: 'L123123',
        },
      })
    );

    expect(screen.getByTestId('notification-heading').textContent).toBe(
      'notification.titles.idCard notification.attached(L123123 - Hxn)'
    );
  });
  it('should return correct title as per type', () => {
    render(
      TitleAsPerType({
        type: NotificationTypes.APPOINTMENT,
        description: 'demo description',
        details: {
          documentType: AttachedDocumentTypes.DOCUMENT_TYPE_ID_CARD,
          customerName: 'Hxn',
          leadId: 'L123123',
        },
      })
    );

    expect(screen.getByTestId('notification-heading').textContent).toBe(
      'demo description notification.with Hxn (L123123)'
    );
  });
  it('should return correct title as per type', () => {
    render(
      TitleAsPerType({
        type: NotificationTypes.DISCOUNT_REQUEST,
        description: '',
        details: {
          status: DiscountRequestTypes.APPROVED,
          customerName: 'Hxn',
          leadId: 'L123123',
        },
      })
    );

    expect(screen.getByTestId('notification-heading').textContent).toBe(
      'notification.titles.discountRequestApprovedHxn (L123123)'
    );
  });
  it('should return correct title as per type', () => {
    render(
      TitleAsPerType({
        type: NotificationTypes.APPROVAL_REQUEST,
        description: '',
        details: {
          agent: 'Hxn',
          agentTeam: 'Hxn Team',
          leadId: 'L123123',
        },
      })
    );

    expect(screen.getByTestId('notification-heading').textContent).toBe(
      'notification.discountRequestCreatedTitle Hxn - Hxn Team (L123123)'
    );
  });
});

describe('Testing DateAsPerType function', () => {
  it('should return correct date as per type', () => {
    render(
      DateAsPerType({
        type: NotificationTypes.DOCUMENT_ATTACHED,
        value: '12/12/2020 (15:00)',
        timeValues: { from: '12/12/2020 (15:00)', to: '12/12/2020 (15:00)' },
      })
    );

    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      'notification.documentAddedDate&nbsp;12/12/2020 (15:00)'
    );
  });
  it('should return correct date as per type', () => {
    render(
      DateAsPerType({
        type: NotificationTypes.DISCOUNT_REQUEST,
        value: '12/12/2020 (15:00)',
        timeValues: { from: '12/12/2020 (15:00)', to: '12/12/2020 (15:00)' },
        status: DiscountRequestTypes.APPROVED,
      })
    );

    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      'notification.discountRequestApprovedDate&nbsp;12/12/2020 (15:00)'
    );
  });
  it('should return correct date as per type', () => {
    render(
      DateAsPerType({
        type: NotificationTypes.DISCOUNT_REQUEST,
        value: '12/12/2020 (15:00)',
        timeValues: { from: '12/12/2020 (15:00)', to: '12/12/2020 (15:00)' },
        status: DiscountRequestTypes.REJECTED,
      })
    );

    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      'notification.discountRequestRejectedDate&nbsp;12/12/2020 (15:00)'
    );
  });
  it('should return correct date as per type', () => {
    render(
      DateAsPerType({
        type: NotificationTypes.APPROVAL_REQUEST,
        value: '12/12/2020 (15:00)',
        timeValues: { from: '12/12/2020 (15:00)', to: '12/12/2020 (15:00)' },
      })
    );

    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      'notification.discountRequestCreatedDate&nbsp;12/12/2020 (15:00)'
    );
  });

  it('should return correct date as per type', () => {
    render(
      DateAsPerType({
        type: NotificationTypes.CONTRACT_SIGNED,
        value: '12/12/2020 (15:00)',
        timeValues: { from: '12/12/2020 (15:00)', to: '12/12/2020 (15:00)' },
      })
    );

    expect(screen.getByTestId('notification-date').innerHTML).toBe(
      'notification.contractSignedDate&nbsp;12/12/2020 (15:00)'
    );
  });
});

describe('Testing IconAsPerType function', () => {
  it('should return correct icon as per given type', () => {
    expect(
      IconAsPerType({
        type: NotificationTypes.APPOINTMENT,
        isNewNotifcation: true,
      })
    ).toStrictEqual(<CalenderIcon variant="new" />);
  });
  it('should return correct icon as per given type', () => {
    expect(
      IconAsPerType({
        type: NotificationTypes.LEAD_ASSIGNMENT,
        isNewNotifcation: true,
      })
    ).toStrictEqual(<ArrowRightCircleIcon variant="new" />);
  });
  it('should return correct icon as per given type', () => {
    expect(
      IconAsPerType({
        type: NotificationTypes.DOCUMENT_ATTACHED,
      })
    ).toEqual(<DocumentIcon />);
  });
  it('should return correct icon as per given type', () => {
    expect(
      IconAsPerType({
        type: NotificationTypes.EMAIL_REPLIED,
      })
    ).toEqual(<EmailIcon />);
  });
  it('should return correct icon as per given type', () => {
    expect(
      IconAsPerType({
        type: NotificationTypes.CONTRACT_SIGNED,
      })
    ).toEqual(<DocumentIcon />);
  });
});
