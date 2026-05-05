import React from 'react';

import './index.scss';
import * as CONSTANTS from 'shared/constants';
import { formatBytes } from 'shared/helper/utilities';

export interface IAttachment {
  name: string;
  fileSize: string;
  label: string;
  embedded: boolean;
  createTime: string;
  updateTime: string;
  deleteTime: string;
  createdBy: string;
}
interface IAttachmentData {
  data: IAttachment;
}

const PdfAttachment: React.FC<IAttachmentData> = ({ data }) => {
  const handleOpen = () => {
    const linkAttachment = `${process.env.VITE_API_ENDPOINT}/${CONSTANTS.apiUrl.leadDetail.getAttachment}/${data.name}:file`;
    const link = document.createElement('a');

    link.setAttribute('target', '_blank');
    link.setAttribute('href', `${linkAttachment}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div
      className="pdf-attachment"
      role="presentation"
      onClick={() => {
        handleOpen();
      }}
    >
      <div className="pdf-attachment__container">
        <div className="pdf-attachment__container__group-item">
          <p className="title unittest-title">{data.label}</p>
          <p className="pdf-size">
            <span className="size unittest-size">
              {formatBytes(data.fileSize)}
            </span>
          </p>
        </div>
      </div>
      <span className="pdf-attachment__triangle gray" />
      <span className="pdf-attachment__triangle" />
    </div>
  );
};
export default PdfAttachment;
