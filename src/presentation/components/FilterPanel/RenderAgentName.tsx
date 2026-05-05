import { Grid } from '@material-ui/core';
import React, { useState, useEffect } from 'react';

import { clearItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import {
  useGetItemAssign,
  useGetItemAssignFull,
} from 'data/slices/orderPolicySlice/selectionsSlice/selector';
import {
  assignCacheUpdate,
  useAgentAssignmentMutation,
} from 'data/slices/orderSlice';
import { useLazyGetAllUserStreamingByLeadSearchQuery } from 'data/slices/userSlice';
import Controls from 'presentation/components/controls/Control';
import {
  getRoleAgent,
  getNotificationSuccess,
  getPayloadAssign,
  getDisable,
  getDisableUnassign,
  typeOfAssign,
} from 'presentation/components/FilterPanel/Filterpanel.helper';
import CommonModal from 'presentation/components/modal/CommonModal';
import AssignModal from 'presentation/components/TableAllLead/assignModal';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { OrderType } from 'shared/constants/orderType';
import { SelectElement } from 'shared/types/controls';

import { TypeAssign } from '../TableAllLead/TableAllLead.helper';

interface AgentModal {
  title: string;
  key: string;
  value: string;
}

const findAgentNameFromUUID = (
  agentID: string,
  status: string,
  agentList: AgentModal[] = []
) => {
  let foundAgent;
  switch (status) {
    case TypeAssign.ASSIGN:
      foundAgent = agentList.find((agent: AgentModal) => agent.key === agentID);
      if (!foundAgent) return '';
      return foundAgent.title;
    case TypeAssign.UNASSIGN:
      return '';
    default:
      return '';
  }
};

function RenderAgentName({
  assignType,
  originalArgs,
}: {
  assignType?: OrderType;
  originalArgs?: any;
}) {
  const dispatch = useAppDispatch();
  const [agentList, setAgentList] = useState<AgentModal[]>([]);
  const [agentsList, setAgentsList] = useState<Array<Record<string, any>>>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusAssign, setStatusAssign] = useState<TypeAssign | string>('');
  const [agentName, setAgentName] = useState('');

  const [
    getUserBySearchService,
    { data: searchUserByRole, isSuccess: searchUserSuccess },
  ] = useLazyGetAllUserStreamingByLeadSearchQuery();

  const { itemAssignToAgent: listCheckBox } = useGetItemAssign();
  const { itemAssignToAgent: listFullItemCheck } = useGetItemAssignFull();
  const [agentAssign] = useAgentAssignmentMutation();

  useEffect(() => {
    dispatch(clearItemAssign());
  }, [dispatch]);

  useEffect(() => {
    const roleByType = getRoleAgent(assignType);
    const rolesAsParams =
      typeof roleByType === 'string' ? roleByType : roleByType?.join('","');
    getUserBySearchService(
      `filter=user.role.keyword in("${rolesAsParams}") user.deleteTime="0001-01-01T00:00:00Z"`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignType]);

  useEffect(() => {
    if (!searchUserSuccess || !searchUserByRole) return;
    setAgentsList(searchUserByRole.users);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUserByRole, searchUserSuccess]);

  useEffect(() => {
    if (searchUserByRole) {
      setAgentList(searchUserByRole.users as unknown as AgentModal[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUserByRole, searchUserSuccess]);

  const confirmAssign = React.useCallback(
    (status: TypeAssign) => () => {
      setStatusAssign(status);
      setShowConfirmModal(true);
    },
    []
  );

  const assignOrderToAgent = React.useCallback(
    async (status: TypeAssign | string) => {
      setShowConfirmModal(false);
      const payload = getPayloadAssign(
        listCheckBox,
        status,
        agentName,
        assignType
      );
      const { assignedTo, resources: orderIds } = payload.body;
      const getAssignedAgent = agentsList.find(
        (agent) => assignedTo === agent.name
      );

      const showSnackBarMessage = (success: boolean) => {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getNotificationSuccess(status),
            status: success
              ? CONSTANTS.snackBarConfig.type.success
              : CONSTANTS.snackBarConfig.type.error,
          })
        );
      };

      const assignPayload = {
        assign_type: assignType as OrderType,
        resources: payload.body.resources,
        assignee: agentName,
      };
      const agentAssignResponse = await agentAssign({
        payload: assignPayload,
      }).unwrap();

      dispatch(clearItemAssign());
      if (agentAssignResponse?.resources) {
        showSnackBarMessage(true);
      } else {
        showSnackBarMessage(false);
      }

      switch (assignType) {
        case OrderType.Document:
        case OrderType.QC: {
          dispatch(
            assignCacheUpdate(
              originalArgs ?? {},
              getAssignedAgent,
              orderIds
            ) as any
          );
          break;
        }
        case OrderType.Submission:
        case OrderType.Approval: {
          dispatch(
            assignCacheUpdate(
              originalArgs ?? {},
              getAssignedAgent,
              orderIds,
              true
            ) as any
          );
          break;
        }
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      agentList,
      agentName,
      agentsList,
      assignType,
      dispatch,
      listCheckBox,
      originalArgs,
    ]
  );

  const handleAgentNameChange = React.useCallback(
    (event: React.ChangeEvent<SelectElement>) => {
      setAgentName(event.target.value as string);
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return (
    <Grid container item xs={12} spacing={4} data-testid="agent-name">
      <Grid item xs={3} className="mt-5">
        <Controls.Select
          options={agentsList}
          label={getString('text.agentName')}
          name="agentName"
          value={agentName}
          onChange={handleAgentNameChange}
          fixedLabel
          selectField="key"
        />
      </Grid>
      <Grid
        container
        item
        xs={3}
        justifyContent="flex-end"
        className="mt-[38px]"
      >
        <Controls.Button
          disabled={getDisable(agentName, listCheckBox)}
          text={getString('text.assign')}
          color="primary"
          onClick={confirmAssign(TypeAssign.ASSIGN)}
          data-testid="assign-btn"
          className="uppercase"
        />
        <Controls.Button
          disabled={getDisableUnassign(listFullItemCheck)}
          text={getString('text.unassign')}
          color="primary"
          onClick={confirmAssign(TypeAssign.UNASSIGN)}
          data-testid="unassign-btn"
          className="uppercase"
        />
        <CommonModal
          title=""
          open={showConfirmModal}
          handleCloseModal={handleCloseModal}
        >
          <AssignModal
            closeModal={handleCloseModal}
            type={statusAssign}
            quantity={listCheckBox.length}
            handleConfirm={() => assignOrderToAgent(statusAssign)}
            typeAssign={typeOfAssign(window.location.pathname) ?? 'order'}
          />
        </CommonModal>
      </Grid>
    </Grid>
  );
}

const showRenderAgentName = (
  isOrderPage: any,
  assignType: OrderType | undefined,
  originalArgs?: any
) => {
  if (isOrderPage && assignType !== OrderType.All) {
    return (
      <RenderAgentName assignType={assignType} originalArgs={originalArgs} />
    );
  }
  return '';
};

export { showRenderAgentName, RenderAgentName, findAgentNameFromUUID };
