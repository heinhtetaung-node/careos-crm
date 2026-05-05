import { Button } from '@alphafounders/ui';
import { PRODUCTS } from 'config/TypeFilter';
import TeamCloud from 'data/repository/admin/team/cloud';
import { useLazyAssignUserSearchQuery } from 'data/slices/gffSlice';
import { useGetAllInsurersByStreamingQuery } from 'data/slices/insurerSlice';
import { useGetSourcesV2Query } from 'data/slices/sourceSlices/sourceSlices';
import { useGetUsersQuery } from 'data/slices/userSlice';
import AssignLead from 'presentation/components/common/AssignLead';
import Autocomplete from 'presentation/components/common/Autocomplete';
import FilterPanel from 'presentation/components/FilterPanel';
import NewLeadScheduleModal from 'presentation/components/modal/LeadScheduleModal/NewLeadScheduleModal';
import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import { Column } from 'presentation/hooks/useTableList';
import {
  assignLeads,
  unassignLeads,
} from 'presentation/redux/actions/leads/lead-assignment';
import { getString } from 'presentation/theme/localization';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import DragAndSort from './columnDragAndDrop';
import { getFields } from './config';
import { initialFilterValues } from './helper';

type AssignModalProps = Omit<
  ModalPropType,
  | 'refetch'
  | 'handleColSettings'
  | 'columns'
  | 'handleSubmit'
  | 'initialValues'
  | 'handleReset'
  | 'reset'
  | 'role'
>;

type FilterModalProps = Omit<
  ModalPropType,
  'refetch' | 'handleColSettings' | 'columns'
>;

type AppointmentModalProps = Omit<
  ModalPropType,
  | 'refetch'
  | 'handleColSettings'
  | 'columns'
  | 'handleSubmit'
  | 'initialValues'
  | 'handleReset'
  | 'reset'
  | 'role'
>;

type SettingsModalProps = Omit<
  ModalPropType,
  | 'refetch'
  | 'handleSubmit'
  | 'initialValues'
  | 'handleReset'
  | 'reset'
  | 'role'
>;

type SaveModalProps = Omit<
  ModalPropType,
  | 'refetch'
  | 'handleColSettings'
  | 'columns'
  | 'handleSubmit'
  | 'initialValues'
  | 'handleReset'
  | 'reset'
  | 'role'
>;

interface ModalPropType {
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
  handleColSettings?: (cols: Column[]) => void;
  columns?: Column[];
  handleSubmit?: (value: any) => void;
  initialValues?: any;
  handleReset?: () => void;
  reset?: boolean;
  role?: string;
  selectedAgents?: string[];
}

const AssignModal = (_props: AssignModalProps) => {
  const { modalInfo, handleModal, selectedAgents } = _props;

  const [teamList, setTeamList] = useState([]);
  const [assignType, setAssignType] = useState('');
  const [totalItem, setTotalItem] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const { data: agentList } = useGetUsersQuery(
    'filter=role in ("roles/sales", "roles/supervisor", "roles/manager") product="products/health-insurance"&pageSize=100'
  );

  useEffect(() => {
    TeamCloud.getTeamsByRole({
      product: PRODUCTS.HEALTH_PRODUCT_INSURANCE,
      role: 'roles/sales',
      pageSize: 100,
    }).subscribe((data: any) => {
      setTeamList(data ?? []);
    });
  }, []);

  const dispatch = useDispatch();
  const handleAssignLead = (status: TypeAssign) => {
    setAssignType(status);
    setShowConfirmModal(true);
    if (status === TypeAssign.ASSIGN) {
      setTotalItem(modalInfo?.data?.buttonState[0]?.ids?.length);
    } else {
      setTotalItem(modalInfo?.data?.buttonState[1]?.ids?.length);
    }
  };

  const confirmAssigned = () => {
    const { buttonState } = modalInfo!.data;
    setAssignLoading(true);
    const callback = () =>
      setTimeout(
        () => {
          setShowConfirmModal(false);
          setAssignLoading(false);
          handleModal({ type: modalInfo.type, show: false });
        },
        Math.max(totalItem * 350, 3000)
      );
    if (assignType === TypeAssign.ASSIGN) {
      dispatch(
        assignLeads({
          ids: buttonState[0].ids,
          assignedTo: agentName,
          callback,
        })
      );
    } else {
      dispatch(
        unassignLeads({
          ids: buttonState[1].ids,
          callback,
        })
      );
    }
  };
  return (
    <div className="h-54">
      <AssignLead
        className="flex-col !ml-0 gap-10"
        agentList={agentList}
        setAgentName={setAgentName}
        assignButtonDisable={
          !(modalInfo?.data?.buttonState[0].ids.length && agentName)
        }
        unassignButtonDisable={
          !modalInfo?.data?.buttonState[1].unassign ||
          selectedAgents?.length === 0 ||
          (selectedAgents?.filter((agent) => !agent) || []).length > 0
        }
        assignType={assignType as TypeAssign}
        totalItem={totalItem}
        assignLoading={assignLoading}
        handleAssignLead={handleAssignLead}
        confirmAssigned={confirmAssigned}
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal}
        typeAssign="lead"
        showCancelButton
        onCancel={handleModal}
        teamList={teamList as any}
        isTeamAssign
      />
    </div>
  );
};

export const FilterModal = ({
  handleSubmit,
  initialValues,
  handleReset,
  reset,
  role,
}: FilterModalProps) => {
  const [initialSelect] = useState(initialFilterValues);

  useEffect(() => {
    if (reset && handleReset) handleReset();
  }, [reset]);

  const [searchAssignedUser] = useLazyAssignUserSearchQuery();
  const { data: sources, isLoading: sourceLoading } = useGetSourcesV2Query({
    useLeadSearchService: true,
  });
  const { data: agentList } = useGetUsersQuery(
    `filter=role in ("roles/sales", "roles/supervisor", "roles/manager") product in ("products/health-insurance")&pageSize=100&showDeleted=true`
  );
  const { data: insurers } = useGetAllInsurersByStreamingQuery({
    pageSize: 100,
  });

  const fields = useMemo(
    () =>
      getFields(searchAssignedUser, {
        sourceLoading,
        sources,
        agentList: agentList?.users
          ? [
              {
                id: 'Unassigned',
                value: '',
                title: getString('text.unassigned'),
              },
              ...(agentList?.users as any)!.map(
                (agent: any, key: number) =>
                  ({
                    title: agent?.title,
                    value: agent?.name,
                    id: agent?.name,
                  }) as any
              ),
            ]
          : [],
        insurers: insurers?.insurers as any,
        role: role ?? '',
      } as any),
    [sourceLoading, agentList, insurers]
  );

  if (reset) return <div className="w-full h-[620px] bg-white" />;

  return (
    <FilterPanel
      collapseButton={false}
      fields={fields}
      initialValues={initialSelect}
      onSubmit={(v) => handleSubmit && handleSubmit(v)}
      onReset={() => handleReset && handleReset()}
      showThaiNationalCheckbox
      showAllRequestCheckbox
    />
  );
};

const AppointmentModal = (props: AppointmentModalProps) => (
  <NewLeadScheduleModal
    isOpen={props.modalInfo.show}
    onClose={() =>
      props.handleModal({ type: props.modalInfo.type, show: false })
    }
    isViewOnly
  />
);

const SettingsModal = (props: SettingsModalProps) => {
  const [cols, setCols] = useState<Column[]>([]);
  const { columns, handleColSettings, modalInfo, handleModal } = props;

  return (
    <div className="h-[420px]">
      <DragAndSort
        columns={columns ?? []}
        activeColumns={[]}
        handleSetActiveColumns={(_cols: Column[]) => setCols(_cols)}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button
          text={getString('healthLead.settingCancel')}
          variant="secondary"
          className="p-3 px-4"
          onClick={() => handleModal({ type: modalInfo.type, show: false })}
        />
        <Button
          disabled={!cols.length}
          onClick={() => handleColSettings?.(cols)}
          text={getString('healthLead.settingApply')}
          className="p-3 px-4"
        />
      </div>
    </div>
  );
};
const SaveModal = ({ modalInfo, handleModal }: SaveModalProps) => (
  <>
    <Autocomplete
      className="my-3"
      textFieldProps={{
        label: 'Field name',
        required: true,
      }}
      options={[]}
    />
    <Autocomplete
      className="my-3"
      textFieldProps={{
        label: 'Field name',
        required: true,
      }}
      options={[]}
    />
    <div className="flex justify-end gap-2 mt-8">
      <Button
        text="Cancel"
        variant="secondary"
        className="p-3 px-4"
        onClick={() => handleModal({ type: modalInfo.type, show: false })}
      />
      <Button disabled text="Save" className="p-3 px-4" />
    </div>
  </>
);

const LeadModals = ({
  modalInfo,
  handleModal,
  refetch,
  handleColSettings,
  columns,
  handleSubmit,
  initialValues,
  selectedAgents,
}: Readonly<{
  modalInfo: any;
  handleModal: (data: any) => void;
  refetch: () => void;
  handleColSettings?: (cols: Column[]) => void;
  columns?: Column[];
  handleSubmit?: (value: any) => void;
  initialValues?: any;
  selectedAgents?: string[];
}>) => {
  const handleRefetch = () => setTimeout(() => refetch(), 1000);

  switch (modalInfo.type) {
    case 'assign':
      return (
        <AssignModal
          {...{
            modalInfo,
            handleModal,
            refetch: handleRefetch,
            selectedAgents,
          }}
        />
      );
    case 'filter':
      return (
        <FilterModal
          {...{
            modalInfo,
            handleModal,
            refetch: handleRefetch,
            handleSubmit,
            initialValues,
          }}
        />
      );
    case 'settings':
      return (
        <SettingsModal
          {...{
            modalInfo,
            handleModal,
            refetch: handleRefetch,
            handleColSettings,
            columns,
          }}
        />
      );
    case 'save':
      return (
        <SaveModal {...{ modalInfo, handleModal, refetch: handleRefetch }} />
      );
    case 'appointment':
      return (
        <AppointmentModal
          {...{ modalInfo, handleModal, refetch: handleRefetch }}
        />
      );
    default:
      return null;
  }
};

export default LeadModals;
