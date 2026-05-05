import React from 'react';

import Controls from 'presentation/components/controls/Control';
import CommonModal from 'presentation/components/modal/CommonModal';
import ErrorModal from 'presentation/components/modal/ErrorModal';
import AddressModal from 'presentation/components/modal/LeadDetailsModal/AddressModal';
import EmailModal from 'presentation/components/modal/LeadDetailsModal/EmailModal';
import PhoneModal from 'presentation/components/modal/LeadDetailsModal/PhoneModal';
import OrderEmailModal from 'presentation/components/modal/OrderDetailModal/OrderEmailModal';
import OrderPhoneModal from 'presentation/components/modal/OrderDetailModal/OrderPhoneModal';
import OrderUpdateModal from 'presentation/components/modal/OrderDetailModal/UpdateModal';
import OrderUpdateModalDocStatus from 'presentation/components/modal/OrderDetailModal/UpdateModalDocStatus';
import DownloadDocumentModal from 'presentation/components/modal/PrintingAndShippingModal/DownloadDocumentModal';
import { getString } from 'presentation/theme/localization';
import { OrderDocumentStatus } from 'shared/constants/orderType';

enum ButtonType {
  Email = 'email',
  Address = 'address',
  Phone = 'phone',
  PhoneOrder = 'phone--order',
  OrderUpdate = 'update--order',
  OrderUpdateDocStatus = 'update--order--doc-status',
  OrderPrintingStatusUpdateError = 'update--order--printing--error',
  DownloadPolicy = 'download--policy',
  DownloadPolicyError = 'download--policy--error',
  OrderEmail = 'email--order',
}

interface ButtonProps {
  open: boolean;
  handleCloseModal: () => void;
  type:
    | 'email'
    | 'address'
    | 'phone'
    | 'phone--order'
    | 'update--order'
    | 'update--order--doc-status'
    | 'update--order--printing--error'
    | 'download--policy'
    | 'download--policy--error'
    | 'email--order';
  text?: string;
  close: () => void;
  title?: string;
  titleCenter?: boolean;
  children: any;
  onClick: () => void;
  modalClass: string;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'danger';
  size?: 'large' | 'medium' | 'small';
  modalSize?: 'xs' | 'sm' | 'md' | 'lg';
  warning?: any;
  hasGreyBg?: any;
  leadId?: string;
  customerId?: string;
  isDisabled?: boolean;
  policyId?: string;
  policyIds?: string[];
}

interface ModalProps {
  docStatus?: OrderDocumentStatus;
  isModalReadOnly?: boolean;
}

function CommonButton({
  open,
  handleCloseModal,
  type,
  text = '',
  close,
  title,
  titleCenter = false,
  children,
  modalClass = '',
  warning = null,
  modalSize,
  hasGreyBg,
  leadId,
  customerId,
  policyId,
  policyIds,
  docStatus,
  isDisabled = false,
  isModalReadOnly = false,
  ...rest
}: ButtonProps & ModalProps) {
  const filterModal: any = {
    [ButtonType.Email]: <EmailModal close={close} customerId={customerId} />,
    [ButtonType.Address]: (
      <AddressModal
        close={close}
        leadId={leadId}
        isReadOnly={isModalReadOnly}
      />
    ),
    [ButtonType.Phone]: <PhoneModal customerId={customerId} close={close} />,
    [ButtonType.PhoneOrder]: (
      <OrderPhoneModal customerId={customerId} close={close} />
    ),
    [ButtonType.OrderUpdate]: (
      <OrderUpdateModal
        close={close}
        warning={warning}
        data-testid="order-update-modal"
      />
    ),
    [ButtonType.OrderUpdateDocStatus]: (
      <OrderUpdateModalDocStatus
        close={close}
        warning={warning}
        data-testid="order-update-modal-demo"
        docStatus={docStatus}
      />
    ),
    [ButtonType.OrderPrintingStatusUpdateError]: (
      <ErrorModal
        close={close}
        errorTitle={getString('leadDetailFields.other.error')}
        errorMsg={getString('errors.changeStatusFail', {
          policyList: policyIds?.join(' , ') ?? '',
        })}
      />
    ),
    [ButtonType.DownloadPolicy]: <DownloadDocumentModal close={close} />,
    [ButtonType.DownloadPolicyError]: (
      <ErrorModal close={close} errorTitle={getString('errors.noFileFound')} />
    ),
    [ButtonType.OrderEmail]: (
      <OrderEmailModal close={close} customerId={customerId} />
    ),
  };

  return (
    <>
      <Controls.Button
        className="shared-button__matbutton"
        disabled={isDisabled}
        data-testid={`${type}-button`}
        {...rest}
      >
        {text || children}
      </Controls.Button>

      <CommonModal
        title={title}
        titleCenter={titleCenter}
        open={open}
        handleCloseModal={handleCloseModal}
        className={modalClass}
        wrapperClass="scroll-address-modal"
        maxWidth={modalSize}
        hasGreyBg={hasGreyBg}
      >
        {filterModal[type]}
      </CommonModal>
    </>
  );
}

CommonButton.defaultProps = {
  text: '',
  variant: 'contained',
  color: 'default',
  size: 'medium',
  modalSize: 'sm',
};

export default CommonButton;
