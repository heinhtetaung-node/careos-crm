import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { formatBytes } from 'shared/helper/utilities';

import PdfAttachment, { IAttachment } from '.';

const PdfData: IAttachment = {
  name: '/mails/5cf7f5d2-2972-4f89-9479-6d412bf31d3c/attachments/2a52ecc8-2ef1-450e-974b-3df216701901',
  fileSize: '21252',
  label: 'Screenshot from 2021-02-04 15-03-23.png',
  embedded: false,
  createTime: '2021-02-18T11:31:58.382051Z',
  updateTime: '2021-02-18T11:31:59.127343Z',
  deleteTime: '0001-01-01T00:00:00Z',
  createdBy: '',
};

describe('<PdfAttachment Component/>', () => {
  it('will be mounted correctly', () => {
    render(<PdfAttachment data={PdfData} />);
  });

  it('check title of pdf file', () => {
    render(<PdfAttachment data={PdfData} />);
    expect(screen.getByText(PdfData.label)).toHaveClass('unittest-title');
  });

  it('check size of pdf file', () => {
    const { container } = render(<PdfAttachment data={PdfData} />);
    expect(container.querySelector('.unittest-size')).toHaveTextContent(
      formatBytes(PdfData.fileSize)
    );
  });
});
