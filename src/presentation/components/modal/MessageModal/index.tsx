import { Button, Dialog, Grid, withTheme, Badge } from '@material-ui/core';
import * as Icon from '@material-ui/icons';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, connect } from 'react-redux';
import styled from 'styled-components';

import { useFetchSMSesQuery } from 'data/slices/leadDetails/smsSlice';
import CopyToClipboard from 'presentation/components/CopyToClipboard';
import MessageModalReply from 'presentation/components/modal/MessageModal/MessageModalReply';
import NewMessage from 'presentation/components/NewMessage';
import NewSMS from 'presentation/components/NewMessage/NewSMS';
import {
  getListEmail,
  getAttachment,
  updateEmailInformation,
} from 'presentation/redux/actions/leadDetail/email';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import './index.scss';

import {
  IPropsMessageModal,
  initialMailData,
  initialId,
  initialSmsData,
  IItemSMS,
} from './messageModal.helper';
import MessageModalEmail from './MessageModalEmail';
import MessageModalItem from './MessageModalItem';
import MessageModalSms from './MessageModalSms';
import SmsModalItem from './SmsModalItem';

import NoMSG from '../../../../images/icons/noMessage.svg';
import { CommunicationType } from '../activityModal/CommunicationTable/index.model';

const TopHeader = withTheme(styled(Grid)`
  &&& {
    padding: 24px 20px;
    flex-basis: auto;
    min-height: 90px;
    background-color: #fff;
    border-radius: 16px 0 0 0;
  }
`);

const ComposeSection = withTheme(styled(Grid)`
  &&& {
    flex-basis: auto;
    min-height: 90px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e9edf5;
  }
`);

enum ComponentType {
  MESSAGE_NEW = 'MESSAGE_NEW',
  MESSAGE_DETAIL = 'MESSAGE_DETAIL',
  MESSAGE_REPLY = 'MESSAGE_REPLY',
}

function MessageModal({
  openDialog,
  closeDialog,
  emailData,
  attachment,
  currentCustomer,
  orderLeadId,
}: IPropsMessageModal & React.HTMLAttributes<HTMLDivElement>) {
  const leadId = orderLeadId ?? getLeadIdFromPath();
  const [mailData, setMailData] = useState(initialMailData);
  const [smsContent, setSmsContent] = useState(initialSmsData);
  const [itemActiveId, setItemActiveId] = useState(initialId);
  const [isComposing, setIsComposing] = useState<string>(
    ComponentType.MESSAGE_DETAIL
  );
  const [replyType, setReplyType] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const [tabState, setTabState] = useState(1);

  const getCurrentTab = (index: number) => {
    setTabState(index);
    setSmsContent(initialSmsData);
    setMailData(initialMailData);
  };

  const { data: smsData, refetch } = useFetchSMSesQuery(
    { leadId },
    { refetchOnMountOrArgChange: true, skip: !leadId }
  );
  const { unReadMailsCount } = useAppSelector((state) => ({
    unReadMailsCount: state.leadsDetailReducer.emailReducer.data.unReadMails,
  }));

  const dispatch = useDispatch();
  const listEmail = useMemo(() => emailData.data?.emails || [], [emailData]);
  const listSms = useMemo(() => smsData?.smses || [], [smsData]);
  const listAttachment = attachment.data?.attachments || [];
  const attachmentLoading = attachment.data?.loading || false;

  const unReadMails = unReadMailsCount;

  useEffect(() => {
    if (openDialog) {
      dispatch(getListEmail(undefined, leadId ?? undefined));
    }
  }, [leadId, openDialog, dispatch, unReadMails]);

  const itemHandleClick = useCallback(
    (item: any, index: number) => {
      if (!item.read) {
        dispatch(updateEmailInformation({ mailId: item.name }));
      }
      setMailData(item);
      setItemActiveId(index.toString());
      dispatch(getAttachment(item.name));
      setIsComposing(ComponentType.MESSAGE_DETAIL);
      setSelectedType(CommunicationType.EMAIL);
    },
    [dispatch]
  );

  const smsHandleClick = useCallback((item: any, index: number) => {
    setSmsContent(item);
    setItemActiveId(index.toString());
    setSelectedType(CommunicationType.SMS);
    setIsComposing(ComponentType.MESSAGE_DETAIL);
  }, []);

  const handleCloseDialog = () => {
    closeDialog(false);
    setMailData(initialMailData);
    setItemActiveId(initialId);
  };

  const handleComposing = () => {
    setIsComposing(ComponentType.MESSAGE_NEW);
    setItemActiveId(initialId);
  };

  const handleCancelMessage = (value: boolean) => {
    setIsComposing(ComponentType.MESSAGE_DETAIL);
    setMailData(initialMailData);
    return value;
  };

  const handleReply = (type: string) => {
    setReplyType(type);
    setIsComposing(ComponentType.MESSAGE_REPLY);
  };

  const renderSmsItem = useMemo(
    () =>
      listSms.map((item: IItemSMS, index: number) => {
        const smsItem = {
          id: index.toString(),
          ...item,
          bodyText: item.message,
        };
        return (
          <SmsModalItem
            key={index as number}
            isActive={itemActiveId}
            onClick={() => {
              smsHandleClick(item, index);
            }}
            smsItem={smsItem}
          />
        );
      }),
    [listSms, itemActiveId, smsHandleClick]
  );

  const allListSorted = useMemo(
    () =>
      [...listEmail, ...listSms].sort(
        (a: any, b: any) => Date.parse(b.createTime) - Date.parse(a.createTime)
      ),
    [listEmail, listSms]
  );

  const allList = useMemo(
    () =>
      allListSorted.map((item, index) => {
        const messageItem = {
          id: index.toString(),
          ...item,
          bodyText: item.emailAddress
            ? item.bodyText
                .replace(/<br><\/br>/g, '\n\n')
                .replace(/<p>|<\/p>|<br>+/g, '')
                .replace(/<a [^>][^>]*?>|<\/a>/g, '')
            : item.bodyText,
        };

        if (item.emailAddress) {
          return (
            <MessageModalItem
              key={index as number}
              isActive={itemActiveId}
              onClick={() => {
                itemHandleClick(item, index);
              }}
              messageItem={messageItem}
            />
          );
        }
        return (
          <SmsModalItem
            key={index as number}
            isActive={itemActiveId}
            onClick={() => {
              smsHandleClick(item, index);
            }}
            smsItem={messageItem}
          />
        );
      }),
    [allListSorted, itemActiveId, itemHandleClick, smsHandleClick]
  );

  const renderMessageItem = useMemo(
    () =>
      listEmail.map((item: any, index: number) => {
        const messageItem = {
          id: index.toString(),
          ...item,
          bodyText: item.bodyText
            .replace(/<br><\/br>/g, '\n\n')
            .replace(/<p>|<\/p>|<br>+/g, '')
            .replace(/<a [^>][^>]*?>|<\/a>/g, ''),
        };
        return (
          <MessageModalItem
            key={index as number}
            isActive={itemActiveId}
            onClick={() => {
              itemHandleClick(item, index);
            }}
            messageItem={messageItem}
          />
        );
      }),
    [listEmail, itemActiveId, itemHandleClick]
  );

  const renderComposedSection = (title: string, renderItems: ReactNode) => (
    <div className="tab-left table-scrollbar">
      <ComposeSection container className="com-box">
        <Grid item xs={12} lg={7}>
          <h3 className="mail-box-hd">{title}</h3>
        </Grid>
        <Grid item xs={12} md={4} lg={5}>
          <div className="header-button">
            <Button
              variant="contained"
              color="primary"
              onClick={handleComposing}
              className="header-button__compose bg-primary"
            >
              {getString('text.compose')}
            </Button>
          </div>
        </Grid>
      </ComposeSection>
      <div className="message-modal__list__items">{renderItems}</div>
    </div>
  );

  return (
    <Dialog
      open={openDialog}
      aria-labelledby="form-dialog-title"
      className="message-modal-wrap shared-common-modal"
    >
      <div
        className="message-modal-override"
        data-testid="message-modal-component"
      >
        <div className="modal-button-close no-background">
          <div className="close-btn">
            <Icon.Close
              onClick={() => handleCloseDialog()}
              className="unittest__message__close-btn"
              data-testid="unittest__message__close-btn"
            />
          </div>
        </div>
        <Grid container className="message-modal">
          <Grid container className="message-modal__list">
            <TopHeader container className="modal-header">
              <Grid item xs={12} md={2}>
                <h3 className="customer-hd">
                  <span data-testid="unittest-customer-name">
                    {currentCustomer?.data?.customerFirstName &&
                    currentCustomer?.data?.customerLastName
                      ? `${currentCustomer.data.customerFirstName} ${currentCustomer.data.customerLastName}`
                      : 'N/A'}
                  </span>
                </h3>
                <div>
                  <span>Lead ID: </span>
                  <span
                    data-testid="unittest-customer-id"
                    className="unittest-lead-reference"
                  >
                    <CopyToClipboard text={currentCustomer.humanId} />
                  </span>
                </div>
              </Grid>
            </TopHeader>
            <div className="container max-w-full">
              <div className="bloc-tabs">
                <button
                  type="button"
                  data-testid="tab-btn-all"
                  className={tabState === 1 ? 'tabs active-tabs' : 'tabs'}
                  onClick={() => getCurrentTab(1)}
                >
                  <Badge
                    invisible={unReadMails === 0}
                    color="error"
                    badgeContent={unReadMails}
                  >
                    {getString('text.all')}
                  </Badge>
                </button>
                <button
                  type="button"
                  data-testid="tab-btn-email"
                  className={tabState === 2 ? 'tabs active-tabs' : 'tabs'}
                  onClick={() => getCurrentTab(2)}
                >
                  <Icon.EmailOutlined />
                  <Badge
                    invisible={unReadMails === 0}
                    color="error"
                    badgeContent={unReadMails}
                  >
                    {getString('text.email')}
                  </Badge>
                </button>
                <button
                  data-testid="tab-btn-sms"
                  type="button"
                  className={tabState === 3 ? 'tabs active-tabs' : 'tabs'}
                  onClick={() => getCurrentTab(3)}
                >
                  <Icon.SmsOutlined />
                  {getString('text.sms')}
                </button>
              </div>

              <Grid item xs={12} className="content-tabs">
                <Grid
                  item
                  xs={12}
                  className={
                    tabState === 1 ? 'content  active-content' : 'content'
                  }
                >
                  <div className="tab-left table-scrollbar">
                    <div className="message-modal__list__items">{allList}</div>
                  </div>
                  <div className="tab-right" data-testid="tab-content">
                    {isComposing === ComponentType.MESSAGE_DETAIL && (
                      <Grid
                        item
                        xs={12}
                        className="message-modal__detail"
                        data-testid="no-msg"
                      >
                        {!mailData.createTime && !smsContent.createTime ? (
                          <div className="no-message-wrapper">
                            <img src={NoMSG} alt="no Message" />
                            <h1 className="no-message-wrapper__text">
                              {getString('text.noMessageSelected')}
                            </h1>
                          </div>
                        ) : (
                          <>
                            {mailData &&
                              selectedType === CommunicationType.EMAIL && (
                                <MessageModalEmail
                                  email={mailData}
                                  attachmentLoading={attachmentLoading}
                                  attachment={listAttachment}
                                  handleReplyEmail={handleReply}
                                />
                              )}
                            {smsContent &&
                              selectedType === CommunicationType.SMS && (
                                <MessageModalSms sms={smsContent} />
                              )}
                          </>
                        )}
                      </Grid>
                    )}
                    {isComposing === ComponentType.MESSAGE_REPLY && (
                      <Grid
                        item
                        xs={12}
                        className="message-modal__reply-compose"
                      >
                        <div className="message-reply-wrapper">
                          <MessageModalReply
                            handleCancelMessage={handleCancelMessage}
                            replyType={replyType}
                            orderLeadId={orderLeadId}
                          />
                        </div>
                      </Grid>
                    )}
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={
                    tabState === 2 ? 'content active-content' : 'content'
                  }
                >
                  {renderComposedSection(
                    getString('text.mailboxCommunications'),
                    renderMessageItem
                  )}

                  <div className="tab-right" data-testid="tab-content">
                    {isComposing === ComponentType.MESSAGE_DETAIL && (
                      <Grid item xs={12} className="message-modal__detail">
                        {!mailData.createTime ? (
                          <div className="no-message-wrapper">
                            <img src={NoMSG} alt="no Message" />
                            <h1 className="no-message-wrapper__text">
                              {getString('text.noMessageSelected')}
                            </h1>
                          </div>
                        ) : (
                          <MessageModalEmail
                            email={mailData}
                            attachmentLoading={attachmentLoading}
                            attachment={listAttachment}
                            handleReplyEmail={handleReply}
                          />
                        )}
                      </Grid>
                    )}
                    {isComposing === ComponentType.MESSAGE_NEW && (
                      <Grid item xs={12} className="message-modal__compose">
                        <div className="new-message-wrapper">
                          <NewMessage
                            orderLeadId={orderLeadId}
                            handleCancelMessage={handleCancelMessage}
                          />
                        </div>
                      </Grid>
                    )}
                    {isComposing === ComponentType.MESSAGE_REPLY && (
                      <Grid
                        item
                        xs={12}
                        className="message-modal__reply-compose"
                      >
                        <div className="message-reply-wrapper">
                          <MessageModalReply
                            handleCancelMessage={handleCancelMessage}
                            replyType={replyType}
                            orderLeadId={orderLeadId}
                          />
                        </div>
                      </Grid>
                    )}
                  </div>
                </Grid>

                <Grid
                  item
                  xs={12}
                  className={
                    tabState === 3 ? 'content  active-content' : 'content'
                  }
                >
                  {renderComposedSection(
                    getString('text.smsboxCommunications'),
                    renderSmsItem
                  )}

                  <div className="tab-right" data-testid="tab-content">
                    {isComposing === ComponentType.MESSAGE_DETAIL && (
                      <Grid item xs={12} className="message-modal__detail">
                        {!smsContent.createTime ? (
                          <div className="no-message-wrapper">
                            <img src={NoMSG} alt="no Message" />
                            <h1 className="no-message-wrapper__text">
                              {getString('text.noMessageSelected')}
                            </h1>
                          </div>
                        ) : (
                          <MessageModalSms sms={smsContent} />
                        )}
                      </Grid>
                    )}
                    {isComposing === ComponentType.MESSAGE_NEW && (
                      <Grid item xs={12} className="message-modal__compose">
                        <div className="new-message-wrapper">
                          <NewSMS
                            orderLeadId={orderLeadId}
                            refetch={refetch}
                            handleCancelMessage={handleCancelMessage}
                          />
                        </div>
                      </Grid>
                    )}
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}

const mapStateToProps = (state: any) => ({
  emailData: state.leadsDetailReducer.emailReducer,
  attachment: state.leadsDetailReducer.attachmentReducer,
  currentCustomer: state.leadsDetailReducer.lead?.payload,
});

export default connect(mapStateToProps)(MessageModal);
