import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

import { UsersResponse } from 'data/slices/userSlice/interface';
import Controls from 'presentation/components/controls/Control';
import CommonModal from 'presentation/components/modal/CommonModal';
import AssignModal from 'presentation/components/TableAllLead/assignModal';
import { TypeAssign } from 'presentation/components/TableAllLead/TableAllLead.helper';
import { getString } from 'presentation/theme/localization';
import { TeamsResponse } from 'data/slices/leadSearchSlice/interface';

interface AssignLead {
  agentList?: UsersResponse;
  setAgentName: (name: string) => void;
  handleAssignLead: (assign: TypeAssign) => void;
  assignButtonDisable: boolean;
  unassignButtonDisable: boolean;
  assignType: TypeAssign;
  totalItem: number;
  assignLoading: boolean;
  confirmAssigned: () => Promise<void> | void;
  showConfirmModal: boolean;
  setShowConfirmModal: (confirm: boolean) => void;
  typeAssign?: string;
  className?: string;
  showCancelButton?: boolean;
  onCancel?: (data: any) => void;
  teamList?: any;
  isTeamAssign?: boolean;
}

function AssignLead({
  agentList,
  setAgentName,
  handleAssignLead,
  assignButtonDisable,
  unassignButtonDisable,
  assignType,
  totalItem,
  assignLoading,
  confirmAssigned,
  showConfirmModal,
  setShowConfirmModal,
  typeAssign,
  onCancel,
  teamList,
  isTeamAssign = false,
  className = '',
  showCancelButton = false,
}: Readonly<AssignLead>) {
  const [_loading, setLoading] = useState(false);
  const [isTeamDisabled, setIsTeamDisabled] = useState(false);
  const [isAgentDisabled, setIsAgentDisabled] = useState(false);
  const handleConfirmAssign = () => {
    setLoading(true);
    (confirmAssigned() || Promise.resolve()).finally(() => setLoading(false));
  };

  return (
    <div
      className={clsx('flex ml-10', className)}
      data-testid="assign-lead-container"
      data-cy="search-lead-button"
    >
      <div className="min-w-[180px] w-auto py-2">
        <Controls.Autocomplete
          options={agentList?.users ?? []}
          label={getString('text.agentName')}
          name="agentName"
          onChange={(event: any) => {
            setAgentName(event?.target?.value?.key);
            setIsTeamDisabled(true);
            setIsAgentDisabled(false);
          }}
          fixedLabel
          testid="select-agent"
          disableClearable
          disabled={isTeamAssign && isAgentDisabled}
          multiple={false}
        />
        {isTeamAssign && (
          <>
            <span className="mt-2">&nbsp;</span>
            <Controls.Autocomplete
              options={
                (teamList as any)?.map((team: any) => ({
                  ...team,
                  id: team.name,
                  key: team.name,
                  value: team.name,
                })) ?? []
              }
              labelField="displayName"
              label={getString('text.team')}
              name="team"
              onChange={(event: any) => {
                setAgentName(event?.target?.value?.key);
                setIsAgentDisabled(true);
                setIsTeamDisabled(false);
              }}
              fixedLabel
              testid="select-team"
              disableClearable
              disabled={isTeamDisabled}
              multiple={false}
            />
          </>
        )}
      </div>
      <div className="flex items-center justify-end pl-5">
        {showCancelButton && (
          <Controls.Button
            data-testid="cancel-button"
            text={getString('text.cancelButton')}
            variant="outlined"
            color="default"
            className="mt-4 button cypress-button-assign uppercase"
            data-cy="button-cancel"
            type="button"
            onClick={onCancel}
          />
        )}
        <Controls.Button
          data-testid="assign-button"
          text={getString('text.assign')}
          color="primary"
          onClick={() => handleAssignLead(TypeAssign.ASSIGN)}
          className="mt-4 button cypress-button-assign uppercase"
          data-cy="button-assign"
          disabled={assignButtonDisable} // !(buttonState[0]?.ids?.length && agentName) assignButtonDisable
        />
        <Controls.Button
          data-testid="unassign-button"
          text={getString('text.unassign')}
          color="primary"
          onClick={() => handleAssignLead(TypeAssign.UNASSIGN)}
          className="mt-4 button uppercase"
          disabled={unassignButtonDisable} // !buttonState[1].unassign unassignButtonDisable
        />
        <CommonModal
          title=""
          open={showConfirmModal}
          handleCloseModal={() => {
            setShowConfirmModal(false);
          }}
          dataTestId="assign-modal"
        >
          <AssignModal
            typeAssign={typeAssign ?? 'lead'}
            closeModal={() => setShowConfirmModal(false)}
            type={assignType}
            quantity={totalItem}
            loading={assignLoading || _loading}
            handleConfirm={handleConfirmAssign}
          />
        </CommonModal>
      </div>
    </div>
  );
}

export default AssignLead;
