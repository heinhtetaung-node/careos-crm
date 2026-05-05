import { Grid } from '@material-ui/core';
import React from 'react';

import { SmsIcon } from '@alphafounders/icons';
import { convertDateTime } from 'shared/helper/convertDateTime';

import { IItemSMS } from '../messageModal.helper';
import './index.scss';

export interface IsmsItem {
  id: number;
  subject: string;
  body: string;
  createdAt: string;
  isInComing: boolean;
}

export interface SmsModalItemProps {
  smsItem: IItemSMS;
  isActive: string;
  onClick: () => void;
}

function SmsModalItem({ smsItem, isActive, onClick }: SmsModalItemProps) {
  return (
    <Grid
      onClick={onClick}
      item
      xs={12}
      data-testid="sms-item"
      className={`mail-section__item ${isActive === smsItem?.id && 'active'}`}
    >
      <div className="mail-section__item__info">
        <div className="mail-info__content-storybook">
          <div className="emailIcon">
            <SmsIcon />
          </div>
          <div className="email-content">
            <p className="email-desc">{smsItem.message}</p>
            <p className="email-details">
              {convertDateTime(smsItem.createTime)}
            </p>
          </div>
        </div>
      </div>
    </Grid>
  );
}
export default SmsModalItem;
