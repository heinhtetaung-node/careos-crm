import { Badge, Grid } from '@material-ui/core';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import {
  AutoMailIcon,
  InboundMailIcon,
  SupportMailIcon,
  EmailIcon,
} from 'presentation/components/icons';
import { convertDateTime } from 'shared/helper/convertDateTime';

import { IItemEmail } from '../messageModal.helper';
import './index.scss';

export interface IMessageItem {
  id: number;
  subject: string;
  body: string;
  createdAt: string;
  isInComing: boolean;
}
export interface IPropsMessageModalItem {
  messageItem: IItemEmail;
  isStoryBook?: boolean;
  isActive: string;
  onClick: () => void;
}

const inboundType = 'INBOUND';
const systemType = 'SYSTEM';
const supportType = 'SUPPORT';
const removeTags = /(<([^>]+)>)/gi;

function MessageModalItem({
  messageItem,
  isStoryBook,
  isActive,
  onClick,
}: PropsWithChildren<IPropsMessageModalItem>) {
  return (
    <Grid
      onClick={onClick}
      item
      xs={12}
      data-testid="email-item"
      className={`email-data mail-section__item ${
        isActive === messageItem?.id && 'active'
      }`}
    >
      <div className="mail-section__item__info">
        {(() => {
          switch (messageItem.type) {
            case systemType:
              return messageItem.read === false ? (
                <div className="emailIcon">
                  <Badge color="error" variant="dot">
                    <AutoMailIcon fontSize="small" className="emailIcon__svg" />
                  </Badge>
                </div>
              ) : (
                <div className="emailIcon">
                  <AutoMailIcon fontSize="small" className="emailIcon__svg" />
                </div>
              );
            case inboundType:
              return messageItem.read === false ? (
                <div className="emailIcon">
                  <Badge color="error" variant="dot">
                    <InboundMailIcon
                      fontSize="small"
                      className="emailIcon__svg"
                    />
                  </Badge>
                </div>
              ) : (
                <div className="emailIcon">
                  <InboundMailIcon
                    fontSize="small"
                    className="emailIcon__svg"
                  />
                </div>
              );
            case supportType:
              return (
                <div className="emailIcon">
                  <SupportMailIcon
                    fontSize="small"
                    className="emailIcon__svg"
                  />
                </div>
              );
            default:
              return messageItem.read === false ? (
                <div className="emailIcon">
                  <Badge color="error" variant="dot">
                    <EmailIcon />
                  </Badge>
                </div>
              ) : (
                <div className="emailIcon">
                  <EmailIcon />
                </div>
              );
          }
        })()}
        <div
          data-testid="unit-email-container"
          className={clsx(
            isStoryBook ? 'mail-info__content-storybook' : 'email-container'
          )}
        >
          <div className="email-content">
            <h2>{messageItem.subject}</h2>
            <p className="email-desc">
              {messageItem.bodyText.replace(removeTags, ' ')}
            </p>
            <p className="email-details">
              {convertDateTime(messageItem.createTime)}
            </p>
          </div>
        </div>
      </div>
    </Grid>
  );
}

export default MessageModalItem;
