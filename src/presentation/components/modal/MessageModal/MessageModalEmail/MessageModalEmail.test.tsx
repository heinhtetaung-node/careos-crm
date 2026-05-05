import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import { IAttachment } from '../Attachment';
import { IItemEmail } from '../messageModal.helper';

import MessageModalEmail from '.';

const emailMockData: IItemEmail = {
  name: '',
  subject: '',
  body: '',
  cc: [],
  bodyText: '',
  createdBy: '',
  emailIndex: 1,
  createTime: '',
  updateTime: '',
  deleteTime: '',
  type: '',
  parentId: '',
  read: true,
};

const PdfData: [IAttachment] = [
  {
    name: '/mails/5cf7f5d2-2972-4f89-9479-6d412bf31d3c/attachments/2a52ecc8-2ef1-450e-974b-3df216701901',
    fileSize: '21252',
    label: 'Screenshot from 2021-02-04 15-03-23.png',
    embedded: false,
    createTime: '2021-02-18T11:31:58.382051Z',
    updateTime: '2021-02-18T11:31:59.127343Z',
    deleteTime: '0001-01-01T00:00:00Z',
    createdBy: '',
  },
];

const handleReplyEmail = jest.fn();

describe('<MessageModalEmail Component/>', () => {
  it('will be mounted correctly', () => {
    render(
      <MessageModalEmail
        attachmentLoading={false}
        attachment={PdfData}
        email={emailMockData}
        handleReplyEmail={handleReplyEmail}
      />
    );
  });
});
