import { SlipIcon, EditIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { camelCase } from 'lodash';

import clsx from 'clsx';
import React, { useMemo } from 'react';

import { getTransactionSlipData } from 'data/slices/leadSearchSlice/helper';
import { useGetTransactionHistoryQuery } from 'data/slices/transactionSlice';
import { ChargeTransformResponse } from 'data/slices/transactionSlice/interface';
import { getString } from 'presentation/theme/localization';

import Loader from 'presentation/components/Loader';
import TextStatus from 'presentation/components/OrderListingTable/TextStatus';

import {
  formatPaymentHistoryResponse,
  initialPaymentHistoryValue,
} from './helper';

function PaymentTableData({
  id,
  data: historyData,
  headers,
  modalInfo,
  handleSubModal,
  handleModal,
  leadHumanId,
}: {
  id: 'charge' | 'refund' | 'credit';
  data: ChargeTransformResponse[];
  headers: string[];
  modalInfo: any;
  handleSubModal: (data: any) => any;
  handleModal: (data: any) => any;
  leadHumanId: string;
}) {
  const getIcon = (icon: string) => {
    if (icon === 'Slip') {
      return <SlipIcon fillColor="white" />;
    }
    return null;
  };

  const getContent = (type: string, value: string, rest: any) => {
    if (type === 'Action') {
      return (
        <Button
          className="text-xs text-center rounded p-2 my-0 mx-auto bg-red-500"
          text={getString('text.refund')}
          disabled={['ใช้แล้ว', 'Used'].includes(rest.status)}
          onClick={() =>
            handleSubModal({
              type: 'refund',
              show: true,
              id: modalInfo.leadId,
              creditId: rest.creditId,
            })
          }
        />
      );
    }
    if (['Payment Status', 'Status'].includes(type)) {
      const isPaymentLinkStatus =
        camelCase(type) === 'paymentLinkStatus' && modalInfo?.isEdit;

      return (
        <Button
          className="bg-transparent w-full"
          icon={isPaymentLinkStatus ? <EditIcon /> : undefined}
          text={
            <TextStatus
              isDownloadable={false}
              label={value}
              status={value}
              type="text"
            />
          }
          onClick={
            isPaymentLinkStatus
              ? () => handleSubModal({ type, show: true })
              : undefined
          }
        />
      );
    }
    return value;
  };

  return historyData.map((data: any) => (
    <tr
      key={data.id}
      className="border-b-2 border-solid border-[#f2f3fa] text-center"
      data-testid={`${id}-row`}
    >
      {headers.map((header: string) => (
        <td key={header} className="p-4 min-w-[100px]">
          {['Slip'].includes(header) ? (
            <Button
              icon={getIcon(header) ?? undefined}
              disabled={!data.slipIdResource}
              className="text-xs text-center !rounded-[50px] p-1 h-5 w-5 my-0 mx-auto"
              text=""
              onClick={() =>
                handleModal({
                  id: leadHumanId,
                  transactionSlipData: getTransactionSlipData(data),
                  type: 'transaction-slip',
                  canEdit: false,
                  show: true,
                })
              }
            />
          ) : (
            getContent(header, data[camelCase(header)], data)
          )}
        </td>
      ))}
    </tr>
  ));
}

function PaymentHistoryModal({ modalInfo, handleModal, handleSubModal }: any) {
  const chargeColumns = [
    'Slip',
    'Payment provider ID',
    'Installment Plan',
    'Payment Method Text',
    'Charge ID',
    'Amount',
    'Created On',
    'Updated On',
    'Payment Status',
  ];
  const creditShellColumns = [
    'Slip',
    'Credit ID',
    'Amount',
    'Created On',
    'Updated On',
    'Status',
  ];
  const refundColumns = [
    'Slip',
    'Refund ID',
    'Refund Amount',
    'Created On',
    'Updated On',
    'Status',
  ];
  const areBiggerColumns = [
    'paymentProviderId',
    'paymentMethodText',
    'chargeId',
  ];

  const paymentTableTranslation: any = {
    paymentProviderId: getString('paymentHistory.paymentProvider.id'),
    installmentPlan: getString('menu.carePay.installment'),
    omiseId: getString('paymentHistory.omiseId'),
    creditId: getString('paymentHistory.creditId'),
    refundId: getString('paymentHistory.refundId'),
    paymentMethodText: getString('menu.carePay.paymentMethod'),
    paymentLinkStatus: getString('paymentHistory.paymentLinkStatus'),
    status: getString('text.status'),
    amount: getString('paymentDetails.installmentDetails.amount'),
    refundAmount: getString('paymentDetails.installmentDetails.refundAmount'),
    omiseDate: getString('paymentHistory.omiseDate'),
    chargeId: getString('paymentHistory.chargeId'),
    createdOn: getString('text.createdOn'),
    updatedOn: getString('text.updatedOn'),
    paymentStatus: getString('text.paymentStatus'),
    failedMessage: getString('text.failedMessage'),
    action: getString('text.action'),
  };

  const { data: paymentHistoryData, isLoading } = useGetTransactionHistoryQuery(
    {
      transactionId: modalInfo.uid,
    }
  );

  const paymentTable = useMemo(() => {
    const { charges } = paymentHistoryData || initialPaymentHistoryValue;

    const tableData = [
      {
        id: 'charge',
        title: getString('paymentHistory.paymentLinkActivitiesLog.root'),
        head: chargeColumns,
        data: formatPaymentHistoryResponse('charge', charges?.charges),
      },
    ];

    return tableData;
  }, [paymentHistoryData, isLoading]);

  const { type, leadHumanId } = modalInfo;

  return (
    <div
      className="px-2 rounded-sm flex flex-col"
      data-testid="paymentHistory-modal"
    >
      {!isLoading ? (
        paymentTable.map((payment: any) => (
          <div className="mb-2 p-1" key={payment.title}>
            <h2 className="font-bold text-sm text-primary text-left">
              {payment.title}
            </h2>
            <div className="overflow-x-auto data-table-container table-scrollbar">
              <table className="border-collapse min-w-full m-0 rounded">
                <thead className="bg-[#f2f3fa]">
                  <tr>
                    {payment.head.map((col: string) => (
                      <td
                        key={`payment-link-${col}`}
                        className={clsx('p-4 text-sm', {
                          'min-w-[220px] w-auto': areBiggerColumns.includes(
                            camelCase(col)
                          ),
                          'min-w-[100px]': !areBiggerColumns.includes(
                            camelCase(col)
                          ),
                        })}
                      >
                        {paymentTableTranslation[camelCase(col)]}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {payment?.data && payment?.data?.length > 0 ? (
                    <PaymentTableData
                      id={payment?.id}
                      headers={payment.head}
                      data={payment?.data}
                      modalInfo={modalInfo}
                      handleSubModal={handleSubModal}
                      handleModal={handleModal}
                      leadHumanId={leadHumanId}
                    />
                  ) : (
                    <tr className="border-b-2 border-solid border-[#f2f3fa]">
                      <td
                        className="p-4 min-w-[100px]"
                        colSpan={payment.head.length}
                      >
                        {getString('text.noData')}...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="min-h-[600px] flex mx-auto my-0">
          <Loader />
        </div>
      )}

      <div className="flex justify-end my-4">
        <Button
          text={getString('text.close')}
          onClick={() => handleModal({ type, show: false })}
          variant="secondary"
          className="w-auto h-auto p-3 px-5 ml-4 text-[14px] font-bold"
        />
      </div>
    </div>
  );
}

export default PaymentHistoryModal;
