import { Button as ButtonUI } from '@alphafounders/ui';
import { QueryStatus } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { getColumns } from './config';
import { NO_USER_ID, UserRoles } from 'config/constant';
import { initialPageState } from 'data/slices/importSlices/helper';
import {
  useAssignContractMutation,
  useLazyGetContractAssignsQuery,
  useUnassignContractMutation,
  useUpdateContractMutation,
} from 'data/slices/leadDetailSlices/ContractSlice';
import { useLazyGenericSearchQuery } from 'data/slices/leadSearchSlice';
import { ContractStatus } from 'data/slices/leadSearchSlice/types';
import { useGetUsersQuery } from 'data/slices/userSlice';
import AssignLead from 'presentation/components/common/AssignLead';
import StatusDialog from 'presentation/components/common/StatusDialog';
import ContractDetailPopup from 'presentation/components/ContractDetailPopup';
import FilterPanel from 'presentation/components/FilterPanel';
import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import useTableList from 'presentation/hooks/useTableList';
import { useStyles } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/index';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import {
  SearchContractPayload,
  getFields,
  initialFilterValues,
  transformUrlQueryDateBetween,
  transformUrlQueryMultiSelect,
  transformUrlQuerySearch,
} from './helper';

import { getUserRoleAccess } from '../common/helper';
import ViewDocumentsContainer from '../common/ViewDocumentsContainer';
import { PRODUCTS } from 'config/TypeFilter';

function ContractListingPage({ product = PRODUCTS.CAR_PRODUCT_INSURANCE }) {
  const [filterUri, setFilterUri] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenContract, setIsOpenContract] = useState(false);
  const [documentId, setDocumentId] = useState();
  const [documentIdCopy, setDocumentIdCopy] = useState();
  const [signature, setSignature] = useState();
  const [selectedDocument, setSelectedDocument] = useState();
  const [selectedContract, setSelectedContract] = useState('');
  const [selectedAssignContract, setSelectedAssignContract] = useState<any>({});
  const [selectedContractStatus, setSelectedContractStatus] = useState();
  const [updateContract, { isSuccess, status: updateStatus }] =
    useUpdateContractMutation();
  const [assignContract, { isSuccess: isAssignSuccess }] =
    useAssignContractMutation();
  const [unassignContract, { isSuccess: isUnAssignSuccess }] =
    useUnassignContractMutation();
  const [getContractAssign] = useLazyGetContractAssignsQuery();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [openedContract, setOpenedContract] = useState();

  const user = useGetUserSelector();

  const { canAssignContract, canApproveContract } = getUserRoleAccess(
    user?.role as UserRoles
  );

  const openDetails = (data: any) => {
    if (data.documentIdCard && data.documentSignature) {
      setIsOpen(true);
      setDocumentId(data.documentIdCard);
      if (data.documentCopyIdCard) {
        setDocumentIdCopy(data.documentCopyIdCard);
      }
      setSignature(data.documentSignature);
      setSelectedDocument(data.documentIdCard);
      setSelectedContract(data.name.split('/').pop());
      setSelectedContractStatus(data.contractStatus);
    } else {
      showErrorSnackbar(getString('carepay.contract.userNoDocument'));
    }
  };

  const openInformation = (data: any) => {
    setOpenedContract(data);
    setIsOpenContract(true);
  };

  const [assignType, setAssignType] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [agentName, setAgentName] = useState('');
  const { data: agentList } = useGetUsersQuery(
    `filter=role in ("roles/quality-control") product="${product}"&pageSize=100`
  );

  const handleApproval = (status: ContractStatus) => {
    updateContract({ status, contractId: selectedContract });
  };

  const handleSelect = (contractId: string, data?: any) => {
    setSelected(
      selected.includes(contractId)
        ? selected.filter((configId) => configId !== contractId)
        : [...selected, contractId]
    );
    setSelectedAssignContract({
      [contractId]: data,
      ...selectedAssignContract,
    });
  };

  const _filterAsPerUser =
    user?.role === UserRoles.QUALITY_CONTROL
      ? `assigned.name in ("${user?.name}")`
      : '';

  const { TableComponent, TopComponent, refetch } = useTableList(
    'carePayContract',
    getColumns(openDetails, openInformation),
    {
      ...initialPageState,
      filter: `${filterUri} contract.productType="${product}"`,
      type: 'contracts',
    },
    useLazyGenericSearchQuery,
    selected,
    handleSelect
  );
  const classes = useStyles();

  const searchContract = (payload: SearchContractPayload) => {
    let url = '';
    const {
      search,
      createTime,
      salesAgents,
      contractStatus,
      noOfInstallments,
      policyStartDate,
      policyEndDate,
    } = payload;
    if (search) {
      url += transformUrlQuerySearch(url, search);
    }
    const dateBetweens = [
      {
        name: 'contract.createTime',
        value: createTime,
      },
      {
        name: 'contract.coverageStartTime',
        value: policyStartDate,
      },
      {
        name: 'contract.coverageEndTime',
        value: policyEndDate,
      },
    ];
    dateBetweens.forEach(({ name, value }) => {
      if (value) url += transformUrlQueryDateBetween(url, value, name);
    });
    const multiSelect = [
      {
        name: 'assigned.name',
        value: salesAgents,
      },
      {
        name: 'contract.status',
        value: contractStatus,
      },
      {
        name: 'price.numberOfInstallments',
        value: noOfInstallments,
      },
    ];
    multiSelect.forEach(({ name, value }) => {
      if (value) url += transformUrlQueryMultiSelect(url, value, name);
    });
    setFilterUri(url);
  };

  useEffect(() => {
    if (isSuccess && updateStatus === QueryStatus.fulfilled) {
      showSuccessSnackbar(getString('carepay.contract.contractUpdateSuccess'));
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStatus, isSuccess]);

  // eslint-disable-next-line consistent-return
  const handleAssignLead = (status: TypeAssign) => {
    if (selected.length < 1) return false;
    setAssignType(status);
    const total = selected.length;
    setShowConfirmModal(true);
    setAssignType(status);
    setTotalItem(total);
  };

  const multipleAssignContract = async (): Promise<{
    successed: string[];
    failed: string[];
  }> => {
    const successed: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      selected.map(async (contract) => {
        try {
          await assignContract({
            user: agentName,
            source: 'MANUAL',
            kind: 'CONTRACT',
            contractId: contract,
          }).unwrap();
          successed.push(contract);
        } catch (error) {
          console.log(error);
          failed.push(contract);
        }
      })
    );
    return { successed, failed };
  };

  const multipleUnAssignContract = async (): Promise<{
    successed: string[];
    failed: string[];
  }> => {
    const successed: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      selected.map(async (contract) => {
        const { data } = await getContractAssign({ contractId: contract });
        const { assignments } = data;
        if (assignments && assignments.length > 0) {
          const { name: contractAssignmentId } = assignments.find(
            (assign: { user: string }) =>
              assign.user === selectedAssignContract[contract].assignedQcId
          );
          try {
            await unassignContract({
              user: agentName,
              source: 'MANUAL',
              kind: 'CONTRACT',
              contractAssignmentId,
            });
            successed.push(contract);
          } catch (error) {
            console.log(error);
            failed.push(contract);
          }
        } else {
          failed.push(contract);
        }
      })
    );
    return { successed, failed };
  };

  const confirmAssign = async () => {
    const assignmentFuncs = {
      [TypeAssign.ASSIGN]: {
        executeFunction: multipleAssignContract,
        errorMsg: 'leadAssignment.notAssigned',
      },
      [TypeAssign.UNASSIGN]: {
        executeFunction: multipleUnAssignContract,
        errorMsg: 'leadAssignment.failToUnassign',
      },
    };
    const { executeFunction, errorMsg } =
      assignmentFuncs[assignType as TypeAssign];
    const { failed } = await executeFunction();
    if (failed.length > 0) {
      showErrorSnackbar(
        getString(errorMsg, {
          unassigned: failed.length,
        })
      );
    } else {
      showSuccessSnackbar(getString('leadAssignment.bulkUpdateSuccess'));
    }
    setShowConfirmModal(false);
    setSelected([]);
  };

  const checkDisable = (type: TypeAssign) => {
    if (!agentName && type === TypeAssign.ASSIGN) return true;
    return (
      selected.length === 0 ||
      selected.filter((id) =>
        type === TypeAssign.ASSIGN
          ? selectedAssignContract[id]?.assignedQcId !== NO_USER_ID
          : selectedAssignContract[id]?.assignedQcId === NO_USER_ID
      ).length > 0
    );
  };

  useEffect(() => {
    if (isAssignSuccess || isUnAssignSuccess || isSuccess) {
      setTimeout(() => refetch(), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssignSuccess, isUnAssignSuccess, isSuccess]);

  return (
    <div data-testid="contract-listing-page">
      <Helmet title="CarePay Contract - Listing Page" />
      <StatusDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        content={
          <ViewDocumentsContainer
            ActionButtons={
              <>
                {selectedContractStatus &&
                  [
                    ContractStatus.SIGNED,
                    ContractStatus.PENDING,
                    ContractStatus.REJECTED,
                  ].includes(selectedContractStatus) &&
                  canApproveContract && (
                    <div className="w-full flex mt-8">
                      <ButtonUI
                        variant="primary"
                        className="uppercase h-10 px-6 mr-2 font-sans"
                        dataTestId="approve-btn"
                        text={getString('text.approve')}
                        onClick={() => handleApproval(ContractStatus.APPROVED)}
                      />
                      {[ContractStatus.SIGNED, ContractStatus.PENDING].includes(
                        selectedContractStatus
                      ) && (
                        <ButtonUI
                          variant="secondary"
                          className="uppercase h-9 px-6 font-sans"
                          dataTestId="close-btn"
                          text={getString('text.reject')}
                          onClick={() =>
                            handleApproval(ContractStatus.REJECTED)
                          }
                        />
                      )}
                    </div>
                  )}
              </>
            }
            selectedDocument={selectedDocument ?? ''}
            setSelectedDocument={setSelectedDocument as any}
            documents={
              [
                {
                  title: 'carepay.contract.nationId',
                  value: documentId ?? '',
                },
                product === PRODUCTS.HEALTH_PRODUCT_INSURANCE &&
                  !!documentIdCopy && {
                    title: 'carepay.contract.nationIdCopy',
                    value: documentIdCopy ?? '',
                  },
                {
                  title: 'carepay.contract.signature',
                  value: signature ?? '',
                },
              ].filter(Boolean) as any[]
            }
          />
        }
        id="contract-approval"
        maxWidth="md"
        width={1080}
        blueTitle={getString('fileBrowseModal.viewDocument')}
      />
      <ContractDetailPopup
        isOpen={isOpenContract}
        setIsOpen={setIsOpenContract}
        openedContract={openedContract}
      />
      <div className="flex flex-row carepay-contract-filter">
        <FilterPanel
          fields={getFields(user?.role ?? '')}
          initialValues={initialFilterValues}
          onSubmit={searchContract}
        />
      </div>
      <div className="flex flex-col mt-2 px-2 bg-white">
        <div className="basis-full w-full pt-6 pb-6 bg-white border border-gray-200 rounded-lg shadow">
          {canAssignContract && (
            <div
              className="w-full items-center pt-4 flex ml-4"
              data-testid="assign-dropdown"
            >
              <AssignLead
                agentList={agentList}
                setAgentName={setAgentName}
                handleAssignLead={handleAssignLead}
                assignButtonDisable={checkDisable(TypeAssign.ASSIGN)}
                unassignButtonDisable={checkDisable(TypeAssign.UNASSIGN)}
                assignType={assignType as TypeAssign}
                totalItem={totalItem}
                assignLoading={false}
                confirmAssigned={confirmAssign}
                setShowConfirmModal={setShowConfirmModal}
                showConfirmModal={showConfirmModal}
              />
            </div>
          )}
          <div
            className={clsx(
              'flex grow-0 basis-full flex-wrap mb-2 justify-end',
              classes.controlBtn
            )}
          >
            <TopComponent />
          </div>
          <div className={classes.table}>
            <TableComponent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractListingPage;
