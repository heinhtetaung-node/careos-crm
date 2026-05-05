import { Button } from '@alphafounders/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { getColumns } from './config';
import { UserRoles } from 'config/constant';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGenericSearchQuery } from 'data/slices/leadSearchSlice';
import {
  useAssignFollowupMutation,
  useUnassignFollowupMutation,
} from 'data/slices/transactionSlice';
import { useGetUsersQuery } from 'data/slices/userSlice';
import AssignLead from 'presentation/components/common/AssignLead';
import Checkbox from 'presentation/components/controls/Checkbox';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import useTableList, { Column } from 'presentation/hooks/useTableList';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import FollowupTable from './FollowupTable';
import { formatFilterURI, getFilterFields } from './helper';
import UpdateModal from './TransactionModals';

import { initialFilterValues, getUserRoleAccess } from '../common/helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

const defaultModalState = {
  title: '',
  type: '',
  show: false,
  shouldAskForSlip: false,
  size: 'xs',
  titleCenter: false,
  data: {},
};

function ActionComponent({
  rows,
  selected,
  isSelectedAll,
  setIsSelectAll,
  setSelected,
  setSelectedTransactionId,
}: any) {
  return (
    <div className="flex flex-col">
      <span className="text-primary text-xs">({selected.length})</span>
      <Checkbox
        label=""
        color="primary"
        checked={isSelectedAll}
        onChange={(e: any) => {
          const isChecked = e.target.checked;
          const child: any = [];
          const parent: any = [];
          if (!isSelectedAll) {
            rows
              .filter((row: any) => row.childItems.length > 0)
              .forEach((row: any) => {
                parent.push({ name: row.configId, ...row });
                row?.childItems?.forEach((_row: any) => {
                  child.push({ name: _row.childId, ..._row });
                });
              });
          }
          setSelected(!isChecked ? [] : child);
          setSelectedTransactionId(!isChecked ? [] : parent);
          setIsSelectAll(!isSelectedAll && parent.length > 0);
        }}
        id="data-checkbox-all"
      />
    </div>
  );
}

function TransactionListingPage() {
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isHealth = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const [selectedTransactionId, setSelectedTransactionId] = useState<string[]>(
    []
  );
  const [filterURI, setFilterURI] = useState('');
  const [selected, setSelected] = useState<
    {
      paymentStatus?: string;
      assignment?: string;
      name: string;
      sendSms?: boolean;
      transactionSnapshotPaymentMethod: string;
    }[]
  >([]);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [assignType, setAssignType] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSelectedAll, setIsSelectAll] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [modal, setModal] = useState<any>(defaultModalState);
  const [subModal, setSubModal] = useState<any>(defaultModalState);

  const currentUser = useGetUserSelector();

  const { canAssign, canCreatePaymentLink, canUpdatePaymentStatus } =
    getUserRoleAccess(currentUser?.role as UserRoles);

  const handleSelect = (
    id: string,
    data?: any,
    singleSelect: boolean = false,
    parentId: string = ''
  ) => {
    if (singleSelect) {
      const assg = data?.find((d: any) => d.childId === id);
      const selectItems = selected.map((x) => x.name).includes(id)
        ? selected.filter((followup) => followup.name !== id)
        : [...selected, { name: id, assignment: assg?.assignment, ...assg }];
      setSelected(selectItems);

      let allcheck = true;
      data.forEach(({ childId }: any) => {
        if (!selectItems.includes(childId)) {
          allcheck = false;
        }
      });
      if (!allcheck && selectedTransactionId.includes(parentId)) {
        setSelectedTransactionId(
          selectedTransactionId.filter(
            (transactionId) => transactionId !== parentId
          )
        );
      }
      if (allcheck && !selectedTransactionId.includes(parentId)) {
        setSelectedTransactionId([...selectedTransactionId, parentId]);
      }
      return;
    }
    let finalSelected = selected;
    data.childItems.forEach((child: any) => {
      const followupId = child.childId;
      finalSelected = selectedTransactionId.includes(id)
        ? finalSelected.filter((configId) => configId.name !== followupId)
        : [
            ...finalSelected,
            {
              name: followupId,
              assignment: child.assignment as string,
              transactionSnapshotPaymentMethod:
                child.transactionSnapshotPaymentMethod ?? '',
            },
          ];
    });

    setIsSelectAll([selectedTransactionId, id].length === data.length);
    setSelected(finalSelected);
    setSelectedTransactionId(
      selectedTransactionId.includes(id)
        ? selectedTransactionId.filter((transactionId) => transactionId !== id)
        : [...selectedTransactionId, id]
    );
  };

  // this function will handle the modal on click of edit buttons
  const handleModal = (data: any) => {
    let info: any = {
      type: '',
      label: '',
      title: `${getString('text.leadId')} ${data.id}`,
      show: false,
      size: 'xs',
      titleCenter: false,
      data: {},
    };

    if (['paymentStatus', 'f_paymentStatus'].includes(data.type)) {
      info = {
        ...info,
        data,
        label: 'status',
        type: 'status',
        show: data.show,
      };
    }

    if (['sms', 'due-date'].includes(data.type)) {
      info = {
        ...info,
        type: data.type,
        show: data.show,
        dueDate: data?.dueDate,
      };
    }

    if (data.type === 'transaction-slip') {
      info = {
        ...info,
        type: 'transaction-slip',
        show: data.show,
        size: 'md',
        titleCenter: true,
        data: data?.transactionSlipData ?? {},
      };
    }

    if (data.type === 'payment-link') {
      info = {
        ...info,
        uid: data.uid,
        title: getString('menu.carePay.createPaymentLink'),
        label: getString('menu.carePay.createPaymentLink'),
        type: 'payment-link',
        size: 'sm',
        show: data.show,
        sendSms: data.sendSms,
        titleCenter: true,
      };
    }
    if (data.type === 'payment-history') {
      info = {
        ...info,
        title: `${getString('menu.carePay.paymentLinkHistory')} : ${getString('carepay.contract.leadId')} ${data.id}`,
        label: `${getString('menu.carePay.paymentLinkHistory')} : ${getString('carepay.contract.leadId')} ${data.id}`,
        type: 'payment-history',
        size: 'lg',
        isEdit: canUpdatePaymentStatus,
        show: data.show,
        titleCenter: true,
        leadHumanId: data.id,
        leadId: data.leadId,
      };
    }

    setModal({
      ...info,
      id: data.id,
      uid: data.childId ?? data.configId,
      shouldAskForSlip: data?.shouldAskForSlip,
    });
  };

  // nested edit modal handler
  const handleSubModal = (data: any) => {
    const info: any = {
      type: '',
      label: '',
      title: getString('paymentHistory.paymentLinkStatus'),
      show: false,
      size: 'xs',
      titleCenter: false,
      data: {},
    };
    if (data.type === 'refund') {
      info.title = getString('text.refund');
      info.creditId = data.creditId;
    }

    setSubModal({
      ...info,
      show: data.show,
      type: data.type,
      titleCenter: true,
      id: data.id,
    });
  };

  const [initialSelect, setInitialSelect] = useState(initialFilterValues);

  const { data: agentList } = useGetUsersQuery(
    'filter=role in ("roles/cash-installment-agent")&pageSize=100'
  );
  const isDeletedTransaction = filterURI.includes('transaction.deleteTime');

  const [
    assignFollowup,
    {
      isLoading: isAssigning,
      isSuccess: isAssignSuccess,
      isError: isAssignError,
      error: assignError,
    },
  ] = useAssignFollowupMutation();
  const [
    unassignFollowup,
    {
      isLoading: isUnAssigning,
      isSuccess: isUnAssignSuccess,
      isError: isUnAssignError,
      error: unAssignError,
    },
  ] = useUnassignFollowupMutation();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  const { TableComponent, TopComponent, refetch, tableData } = useTableList(
    'carePayTransaction',
    getColumns(
      handleModal,
      currentUser.role as UserRoles,
      isHealth
    ) as Column[],
    {
      ...initialPageState,
      orderBy: 'transaction.createTime desc',
      filter: `${filterURI} ${!isDeletedTransaction ? 'transaction.deleteTime="0001-01-01T00:00:00Z"' : ''} attributes.lead.product="${globalProduct ?? PRODUCTS.CAR_PRODUCT_INSURANCE}"`,
      type: 'transactions',
    },
    useLazyGenericSearchQuery,
    selected.map((s) => s.name),
    handleSelect,
    [isAssignSuccess, isUnAssignSuccess],
    true,
    FollowupTable,
    openIds,
    setOpenIds
  );

  const handleResetFilter = useCallback(() => {
    setInitialSelect(initialFilterValues);
    setFilterURI('');
    setSelected([]);
    setSelectedTransactionId([]);
    setIsSelectAll(false);
  }, []);

  const handleSubmit = useCallback((payload: any) => {
    setFilterURI(formatFilterURI(payload));
  }, []);

  const handleCloseModal = () => handleModal(defaultModalState);
  const handleCloseSubModal = () => handleSubModal(defaultModalState);

  const handleAssignLead = (status: TypeAssign): boolean => {
    if (selected.length < 1) return false;
    setAssignType(status);
    const total = selected.length;
    setShowConfirmModal(true);
    setAssignType(status);
    setTotalItem(total);
    return true;
  };

  const handleAssignFollowup = async () => {
    try {
      const queries = selected.map(async (followup) => {
        const props = { userId: agentName, followup: followup.name };
        if (assignType === 'UNASSIGN' && followup.assignment) {
          return unassignFollowup({
            userId: agentName,
            followup: followup.assignment,
          });
        }
        if (assignType !== 'UNASSIGN') {
          return assignFollowup(props);
        }
        return Promise.resolve();
      });
      await Promise.allSettled(queries);
      await new Promise<void>((res, _) => {
        setTimeout(() => {
          refetch();
          setShowConfirmModal(false);
          setSelected([]);
          setSelectedTransactionId([]);
          setIsSelectAll(false);
          res();
        }, 2000);
      });
    } catch (err) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: (err as Error)?.message ?? '',
        })
      );
    }
  };

  const isSuccess = isAssignSuccess || isUnAssignSuccess;
  const isLoading = isAssigning || isUnAssigning;
  const isError = isAssignError || isUnAssignError;
  const error = assignError || unAssignError;
  const isAssignDisabled = isLoading || !selected.length || agentName === '';

  useEffect(() => {
    if (isLoading) return;
    if (isSuccess) {
      showSuccessSnackbar(getString('paymentStatus.successful'));
    }
    if (isError) {
      const { message = '' } = (error as any).data;
      showErrorSnackbar(
        getString('text.errorMessage', {
          message,
        })
      );
    }
  }, [
    isLoading,
    isSuccess,
    isError,
    showSuccessSnackbar,
    showErrorSnackbar,
    error,
  ]);

  useEffect(() => {
    setOpenIds([]);
    setSelected([]);
    setSelectedTransactionId([]);
    setIsSelectAll(false);
  }, [tableData]);

  return (
    <div data-testid="transaction-listing-page">
      <Helmet title="CarePay - Transaction Listing Page" />
      <div className="flex flex-row">
        <FilterPanel
          fields={getFilterFields(agentList?.users) as unknown as any}
          initialValues={initialSelect}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
        />
      </div>

      <div className="flex flex-col mt-2 px-2 bg-white ">
        <div
          className="w-full md:justify-between flex-wrap items-center flex flex-row my-4"
          data-testid="assign-dropdown"
        >
          {canAssign && (
            <div className="w-full p-4">
              <AssignLead
                agentList={agentList}
                setAgentName={setAgentName}
                handleAssignLead={handleAssignLead}
                assignButtonDisable={isAssignDisabled || isDeletedTransaction}
                unassignButtonDisable={
                  selected.length === 0 || isDeletedTransaction
                }
                assignType={assignType as TypeAssign}
                totalItem={totalItem}
                assignLoading={isLoading}
                confirmAssigned={handleAssignFollowup}
                setShowConfirmModal={setShowConfirmModal}
                showConfirmModal={showConfirmModal}
                typeAssign="followup"
              />
            </div>
          )}
          <Button
            text={getString('menu.carePay.createPaymentLink')}
            onClick={() =>
              handleModal({
                ...modal,
                childId: selected[0].name,
                show: selected.length > 0,
                sendSms: selected[0]?.sendSms ?? false,
                type: 'payment-link',
              })
            }
            dataTestId="payment-link-btn"
            disabled={
              !canCreatePaymentLink ||
              selected.length !== 1 ||
              selected.filter((followUp) => followUp.paymentStatus === 'PAID')
                .length > 0 ||
              isDeletedTransaction ||
              selected.filter(
                (followUp) =>
                  followUp.transactionSnapshotPaymentMethod === 'CREDIT_TERM'
              ).length > 0
            }
            className="w-auto h-auto p-4 px-5 ml-4 font-[Poppins,Kanit] text-[14px] font-bold"
          />
        </div>
        <div
          className="
              flex grow-0 basis-full flex-wrap mb-2 justify-end"
        >
          <TopComponent />
        </div>
        <div className="mt-1">
          <TableComponent
            ExpandableComponentParams={{
              handleEdit: handleModal,
              canEdit: canUpdatePaymentStatus && !isDeletedTransaction,
              role: currentUser.role,
              isAllSelectable: true,
            }}
            ActionCellElements={({ rows }) =>
              ActionComponent({
                rows,
                selected,
                selectedTransactionId,
                isSelectedAll,
                setIsSelectAll,
                setSelected,
                setSelectedTransactionId,
              })
            }
          />
        </div>
      </div>
      {modal.show && modal.type && (
        <CommonModal
          maxWidth={(modal.size as any) ?? 'xs'}
          titleCenter={modal.titleCenter ?? false}
          title={modal.title}
          isShowCloseBtn
          open={modal.show && !isDeletedTransaction}
          handleCloseModal={handleCloseModal}
          dataTestId="update-modal"
        >
          <UpdateModal
            refetch={refetch}
            modalInfo={modal}
            handleModal={handleModal}
            handleSubModal={handleSubModal}
          />
        </CommonModal>
      )}
      {/* sub modal */}
      {subModal.show && subModal.type && (
        <CommonModal
          maxWidth="xs"
          titleCenter
          title={subModal.title}
          isShowCloseBtn
          open={subModal.show}
          handleCloseModal={handleCloseSubModal}
          wrapperClass="z-[99999]"
          dataTestId="paymentHistory-update-modal"
        >
          <UpdateModal
            modalInfo={subModal}
            refetch={refetch}
            handleModal={handleSubModal}
          />
        </CommonModal>
      )}
    </div>
  );
}

export default TransactionListingPage;
