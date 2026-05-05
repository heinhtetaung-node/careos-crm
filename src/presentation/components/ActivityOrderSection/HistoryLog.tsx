import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useLocation, useMatch, useParams } from 'react-router-dom';

import { UserRoles } from 'config/constant';
import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import CommunicationTable from 'presentation/components/modal/activityModal/CommunicationTable';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import MutationResponseDialog from 'presentation/components/common/StatusDialog';
import { Button as ButtonV2 } from '@alphafounders/ui';
import CopyButton from 'presentation/components/common/PaymentDialogActionButtons/CopyButton';

import SubmissionTable from './SubmissionTable';

import { getString } from '../../theme/localization';
import Dialog from '../common/Dialog';
import HistoryTable from '../modal/activityModal/HistoryTable';
import Controls from '../controls/Control';
import { useCreateContractMutation } from 'data/slices/leadDetailSlices/ContractSlice';
import { showContractMessage } from 'presentation/pages/car-insurance/CreateContractPage/types';
import { bahtToSatang } from 'utils/currency';
import { useGetLeadContractDetailsQuery } from 'data/slices/leadSlice';
import { ErrorIcon, SuccessIcon } from '@alphafounders/icons';
import { addLink } from '../common/PaymentDialogActionButtons/helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { OrderQcStatus } from 'shared/constants/orderType';

interface HistoryContentProps {
  activeTab: 'communication' | 'submission' | 'history';
  setActiveTab: React.Dispatch<
    React.SetStateAction<'communication' | 'submission' | 'history'>
  >;
  displayTabs: {
    [key in 'communication' | 'submission' | 'history']?: boolean;
  };
  role: string;
  allowedHistoryRole: UserRoles[];
}

const allowedHistoryRoleAll = [
  UserRoles.ADMIN_ROLE,
  UserRoles.SUPER_ADMIN_ROLE,
  UserRoles.MANAGER_ROLE,
  UserRoles.SUPERVISOR_ROLE,
  UserRoles.BACK_OFFICE,
];

const allowedContractRole = [
  ...allowedHistoryRoleAll,
  UserRoles.QUALITY_CONTROL,
  UserRoles.BACK_OFFICE,
];

function HistoryContent({
  activeTab,
  setActiveTab,
  displayTabs: { communication = true, submission = true, history = true },
  role,
  allowedHistoryRole,
}: HistoryContentProps) {
  const { orderId } = useParams();
  const { data } = useGetOrderItemsQuery({ orderId: orderId! });
  const leadId = data?.order?.lead.split('/')[1] ?? '';

  const getHistoryContent = () => {
    if (activeTab === 'communication') {
      return <CommunicationTable id={leadId} />;
    }

    if (activeTab === 'history') {
      return <HistoryTable id={orderId!} />;
    }

    return <SubmissionTable />;
  };

  const styleClass = `border-[3px] border-solid border-primary hover:border-[3px] hover:border-primary`;

  return (
    <div>
      {communication && (
        <Button
          variant="outlined"
          className={`h-auto mr-3 px-4 py-2 ${
            activeTab === 'communication' ? styleClass : ''
          }`}
          color="primary"
          onClick={() => setActiveTab('communication')}
        >
          {getString('lead.communication')}
        </Button>
      )}
      {submission && (
        <Button
          variant="outlined"
          className={`h-auto mr-3 px-4 py-2 ${
            activeTab === 'submission' ? styleClass : ''
          }`}
          color="primary"
          onClick={() => setActiveTab('submission')}
        >
          {getString('menu.order.submission')}
        </Button>
      )}

      {history && allowedHistoryRole.includes(role as UserRoles) && (
        <Button
          variant="outlined"
          className={`h-auto mr-3 px-4 py-2 ${
            activeTab === 'history' ? styleClass : ''
          }`}
          color="primary"
          onClick={() => setActiveTab('history')}
        >
          {getString('lead.activity')}
        </Button>
      )}

      <div className="mt-4">{getHistoryContent()}</div>
    </div>
  );
}

export default function HistoryLog() {
  const routeMatchQcCar = useMatch('/orders/qc/:id');
  const routeMatchQcHealth = useMatch('/health/orders/qc/:orderId');
  const routeMatchQc = routeMatchQcCar || routeMatchQcHealth;
  const [openDialog, setOpenDialog] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] =
    useState<HistoryContentProps['activeTab']>('communication');
  const { pathname } = useLocation();
  const { jsonUpdater: updateLead } = useLeadUpdater();
  const isSubmissionDetailPage = pathname.split('/')[5] === 'submission';
  const currentUser = useAppSelector((state) => state.authReducer.data.user);
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { orderId } = useParams();
  const { data: orderData } = useGetOrderItemsQuery(
    { orderId: orderId! },
    {
      skip: !routeMatchQc,
    }
  );
  const allowedHistoryRole = allowedHistoryRoleAll.filter(
    (role) =>
      globalProduct === 'products/health-insurance' ||
      role !== UserRoles.BACK_OFFICE
  );

  const leadId = orderData?.order?.lead.split('/')[1] ?? '';

  const { data, refetch } = useGetLeadContractDetailsQuery(leadId, {
    skip: !routeMatchQc,
  });

  const [message, setMessage] = useState('');
  const [contractLink, setContractLink] = useState('');

  const [
    createContract,
    {
      isLoading: isPaymentLoading,
      isError: isPaymentError,
      isSuccess,
      data: contractResponseData,
    },
  ] = useCreateContractMutation();

  useEffect(() => {
    if (isSuccess) {
      if (!('error' in contractResponseData)) {
        if (!isOpen) setIsOpen(true);
        const { contractLink: responseContractLink } = contractResponseData;
        setMessage(
          showContractMessage(
            '',
            orderData?.order?.humanId ?? '',
            '',
            responseContractLink
          )
        );
        setContractLink(responseContractLink);
      }
    }
  }, [isSuccess]);

  const handleCreateContract = async () => {
    await updateLead(
      [
        ...(new Date(
          orderData?.items?.[0]?.item?.policyStartDate || ''
        ).getFullYear() -
          new Date().getFullYear() <
        2
          ? [
              {
                path: '/policyStartDate',
                value: routeMatchQcCar
                  ? orderData?.items
                      ?.find(
                        (item) =>
                          item?.package?.insuranceCategory === 'VOLUNTARY'
                      )
                      ?.item?.policyStartDate?.slice(0, 10)
                  : orderData?.items?.[0]?.item?.policyStartDate?.slice(0, 10),
                op: 'replace' as const,
              },
            ]
          : []),
        {
          path: routeMatchQcCar
            ? '/policyHolderFirstName'
            : '/policyHolder/firstName',
          value: orderData?.order?.data?.policyHolder?.firstName,
          op: 'replace',
        },
        {
          path: routeMatchQcCar
            ? '/policyHolderLastName'
            : '/policyHolder/lastName',
          value: orderData?.order?.data?.policyHolder?.lastName,
          op: 'replace',
        },
        ...(routeMatchQcCar
          ? [
              {
                path: '/carLicensePlate',
                value: orderData?.order?.data?.carLicensePlate,
                op: 'replace' as const,
              },
            ]
          : []),
        {
          path: routeMatchQcCar
            ? '/policyHolderNationalId'
            : '/policyHolder/nationalId',
          value: orderData?.order?.data?.idNumber,
          op: 'replace',
        },
      ],
      true,
      leadId
    );

    await refetch();

    const numberOfInstallment = data?.packageDetails?.numberOfInstallments;
    const paymentSummary =
      data?.packageDetails?.priceDetails?.installmentDetails?.[0];
    const paymentSummaryNext =
      data?.packageDetails?.priceDetails?.installmentDetails?.[1];

    createContract({
      payment_method: data?.packageDetails?.paymentMethod ?? 'QR_CODE',
      installment_plan: numberOfInstallment ?? 1,
      coverage_end_date: data?.carQuoteInformation?.endDate ?? new Date(),
      due_date: new Date().toISOString(),
      policy_holder_national_id: orderData?.order?.data?.idNumber || '',
      leadId,
      installment_amount: {
        first_month: bahtToSatang(paymentSummary?.paymentAmount ?? 0),
        next_month: bahtToSatang(paymentSummaryNext?.paymentAmount ?? 0),
      },
    });
  };

  return (
    <div className="p-5 flex">
      <MutationResponseDialog
        icon={
          isPaymentError ? (
            <ErrorIcon fontSize="large" />
          ) : (
            <SuccessIcon fontSize="large" />
          )
        }
        isOpen={isOpen}
        isLoading={isPaymentLoading}
        isError={isPaymentError}
        setIsOpen={setIsOpen}
        title={
          isPaymentError
            ? getString('text.createContractFailed')
            : getString('text.contractCreated')
        }
        content={
          isPaymentError ? (
            getString('text.contractCreatedError')
          ) : (
            <div className="border-slate-300 border-radius-20 rounded-lg border-solid w-80 h-auto p-3 bg-slate-200 success-text whitespace-pre-wrap break-words text-left">
              {addLink(message, contractLink)}
            </div>
          )
        }
        showCloseBtn={!isPaymentError && true}
        actionButton={
          isPaymentError ? (
            <ButtonV2
              className="uppercase w-32 border-0 !bg-red-500 mt-2 hover:!bg-red-400 h-10 text-white font-sans"
              onClick={handleCreateContract}
              dataTestId="tryagain-btn"
              text={getString('text.tryAgain')}
            />
          ) : (
            <CopyButton
              successMessage={message}
              successMessageAlert={getString('text.copyMessageContract')}
            />
          )
        }
        id={isPaymentError ? 'error-dialog' : 'success-dialog'}
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          setActiveTab('communication');
          setOpenDialog(true);
        }}
        className="h-auto mr-3 px-4 py-2"
        data-testid="communication-btn"
      >
        {getString('lead.communication')}
      </Button>

      {isSubmissionDetailPage && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setActiveTab('submission');
            setOpenDialog(true);
          }}
          className="h-auto mr-3 px-4 py-2"
          data-testid="communication-btn"
        >
          {getString('menu.order.submission')}
        </Button>
      )}
      {allowedHistoryRole.includes(currentUser?.role) && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setActiveTab('history');
            setOpenDialog(true);
          }}
          className="h-auto mr-3 px-4 py-2"
          data-testid="history-btn"
        >
          {getString('lead.activity')}
        </Button>
      )}
      {routeMatchQc && allowedContractRole.includes(currentUser?.role) && (
        <Controls.Button
          color="primary"
          onClick={handleCreateContract}
          data-testid="create-contract-button"
          disabled={
            orderData?.order?.qcStatus !== OrderQcStatus.PENDING ||
            orderData?.order?.isFullyPaid ||
            orderData?.order?.isCancelled
          }
        >
          {getString('text.createContract')}
        </Controls.Button>
      )}
      <Dialog
        open={openDialog}
        maxWidth="lg"
        content={
          <HistoryContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            displayTabs={{
              submission: isSubmissionDetailPage,
            }}
            role={currentUser?.role}
            allowedHistoryRole={allowedHistoryRole}
          />
        }
        handleToggle={() => setOpenDialog(false)}
      />
    </div>
  );
}
