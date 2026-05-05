/* eslint-disable react/function-component-definition */
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import * as Icon from '@material-ui/icons';
import clsx from 'clsx';
import React from 'react';
import styled from 'styled-components';
import './index.scss';

export const CustomDialogContent = styled(DialogContent)`
  min-width: 300px;
`;

interface ICommonModal {
  children: any;
  open: boolean;
  title?: string;
  titleCenter?: boolean;
  handleCloseModal(): void;
  isNotHeader?: boolean;
  wrapperClass?: string;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isShowCloseBtn?: boolean;
  hasBorderRadius?: boolean;
  isHeaderCenter?: boolean;
  hasGreyBg?: boolean;
  dataTestId?: string;
}
const CommonModal: React.FC<ICommonModal> = ({
  children,
  open,
  title,
  titleCenter = false,
  handleCloseModal,
  isNotHeader,
  wrapperClass,
  className,
  maxWidth = 'sm',
  isShowCloseBtn = true,
  hasBorderRadius,
  isHeaderCenter,
  hasGreyBg,
  dataTestId = 'common-modal',
}) => (
  <Dialog
    open={open}
    aria-labelledby="form-dialog-title"
    className={clsx(
      'shared-common-modal',
      wrapperClass,
      hasBorderRadius && 'add-modal-border'
    )}
    maxWidth={maxWidth}
    fullWidth
    data-testid={dataTestId}
  >
    <div
      className={clsx(
        'modal-header',
        isNotHeader && 'no-background',
        hasBorderRadius && 'add-border',
        isHeaderCenter && 'text-center',
        hasGreyBg && 'bg-grey'
      )}
    >
      {title ? (
        <DialogTitle
          className={clsx('unittest-title', titleCenter && 'text-center')}
          id="form-dialog-title"
        >
          {title}
        </DialogTitle>
      ) : null}
      {isShowCloseBtn && (
        <div className="close-btn">
          <Icon.Close data-testid="close-button" onClick={handleCloseModal} />
        </div>
      )}
    </div>
    <CustomDialogContent>
      <div className={className || 'select-box'}>{children}</div>
    </CustomDialogContent>
  </Dialog>
);
export default CommonModal;
