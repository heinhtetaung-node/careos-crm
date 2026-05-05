import { Grid, makeStyles } from '@material-ui/core';
import React, { PropsWithChildren, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useConfirmRejectionMutation } from 'data/slices/rejectionSlice';
import { useGetUsersQuery } from 'data/slices/userSlice';
import {
  assignLeads,
  unassignLeads,
} from 'presentation/redux/actions/leads/lead-assignment';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import useSnackbar from 'utils/snackbar';

import LeadRejectionModal from './rejectionModal';
import { TableAllLeadButtonRow, TypeAssign } from './TableAllLead.helper';
import { RejectionType } from './TableRejectionLead.helper';

import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import AssignLead from '../common/AssignLead';
import Controls from '../controls/Control';
import CommonModal from '../modal/CommonModal';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: '20px',
  },
  assignButton: {
    [theme.breakpoints.down('md')]: {
      marginBottom: '10px',
    },
  },
}));

enum Breakpoints {
  xl = 'xl',
  lg = 'lg',
}

interface TableAllLeadButtonProps {
  isAssign?: boolean;
  isReject?: boolean;
  buttonState: any[];
  callApiAgain: CallableFunction;
}

function TableAllLeadButton({
  children,
  isAssign,
  isReject,
  buttonState,
  callApiAgain,
}: PropsWithChildren<TableAllLeadButtonProps>) {
  const classes = useStyles();

  const product = useAppSelector(
    (state) =>
      state.typeSelectorReducer.globalProductSelectorReducer?.data || ''
  );

  const { data: agentList } = useGetUsersQuery(
    `filter=role in ("roles/sales") product in ("${product}")&pageSize=100`,
    {
      skip: !isAssign,
    }
  );

  const [agentName, setAgentName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assignType, setAssignType] = useState('');
  const [rejectionType, setRejectionType] = useState('');
  const [totalItem, setTotalItem] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  const { data: user } = useGetAuthenticateQuery();
  const [approveRejection] = useConfirmRejectionMutation();

  const dispatch = useDispatch();
  const { showErrorSnackbar } = useSnackbar();

  const checkIfLeadIsPurchased = (leads: { status: string }[]) => {
    const isLeadPurchased = leads.some(
      (lead) => lead.status === 'leadStatus.purchased'
    );

    if (isLeadPurchased) {
      showErrorSnackbar(getString('errors.cannotRejectLeadWithPurchaseStatus'));
      return true;
    }
    return false;
  };
  const handleAssignLead = (status: TypeAssign) => {
    setShowConfirmModal(true);
    setAssignType(status);
    if (status === TypeAssign.ASSIGN) {
      setTotalItem(buttonState[0]?.ids?.length);
    } else {
      setTotalItem(buttonState[1]?.ids?.length);
    }
  };

  const handleRejectionLead = (status: RejectionType) => {
    if (status === 'APPROVE' && checkIfLeadIsPurchased(buttonState[2].statuses))
      return null;
    setShowConfirmModal(true);
    setRejectionType(status);
    setTotalItem(buttonState[2]?.rejections?.length || 0);
    return true;
  };

  const confirmAssigned = () => {
    setAssignLoading(true);
    const callback = () =>
      setTimeout(
        () => {
          setShowConfirmModal(false);
          setAssignLoading(false);
          callApiAgain();
        },
        Math.max(totalItem * 350, 3000)
      );
    if (assignType === TypeAssign.ASSIGN) {
      dispatch(
        assignLeads({
          ids: buttonState[0]?.ids,
          assignedTo: agentName || user?.name,
          callback,
        })
      );
    } else {
      dispatch(
        unassignLeads({
          ids: buttonState[1]?.ids,
          callback,
        })
      );
    }
  };

  const confirmRejection = async () => {
    const body = buttonState[2];
    body.approve = rejectionType === RejectionType.APPROVE;
    setButtonLoading(true);
    const response: any = await approveRejection(body);

    if ('error' in response) {
      setShowConfirmModal(false);
      callApiAgain();
      setButtonLoading(false);
      dispatch(
        showSnackBar({
          isOpen: true,
          message: response.error.error || '',
          status: CONSTANTS.snackBarConfig.type.error,
          isNotClose: true,
        })
      );
    } else {
      setTimeout(
        () => {
          callApiAgain();
          setShowConfirmModal(false);
          setButtonLoading(false);
          dispatch(
            showSnackBar({
              isOpen: true,
              message: response?.data?.message || '',
              status: CONSTANTS.snackBarConfig.type.success,
            })
          );
        },
        Math.max(totalItem * 350, 3000)
      );
    }
  };

  const rejectButtons = () => (
    <Grid
      container
      item
      xs={12}
      md={6}
      lg={4}
      xl={5}
      classes={{ root: classes.root }}
    >
      <Controls.Button
        text="Approve"
        color="primary"
        className="button uppercase"
        onClick={() => handleRejectionLead(RejectionType.APPROVE)}
        disabled={!buttonState[2].rejections.length || buttonLoading} // Need to check with other params
        data-testid="reject-buttons-approve-btn"
      />
      <Controls.Button
        text="Decline"
        color="primary"
        className="button uppercase"
        onClick={() => handleRejectionLead(RejectionType.DECLINE)}
        disabled={!buttonState[2].rejections.length || buttonLoading} // Need to check with other params
        data-testid="reject-buttons-decline-btn"
      />
      <CommonModal
        title=""
        open={showConfirmModal}
        handleCloseModal={() => {
          setShowConfirmModal(false);
        }}
        isShowCloseBtn={false}
      >
        <LeadRejectionModal
          closeModal={() => setShowConfirmModal(false)}
          type={rejectionType}
          quantity={totalItem}
          handleConfirm={confirmRejection}
          buttonLoading={buttonLoading}
        />
      </CommonModal>
    </Grid>
  );

  const responsivePaging = (size: Breakpoints) => {
    if (isAssign) {
      return size === Breakpoints.lg
        ? TableAllLeadButtonRow.PAGING_LG
        : TableAllLeadButtonRow.PAGING_XL;
    }
    if (isReject) {
      return size === Breakpoints.lg
        ? TableAllLeadButtonRow.REJECT_PAGING_LG
        : TableAllLeadButtonRow.PAGING_XL;
    }

    return TableAllLeadButtonRow.PAGING_LG;
  };

  return (
    <Grid container item xs={12} lg={12} className="all-leads-buttons">
      {isAssign && (
        <AssignLead
          agentList={agentList}
          setAgentName={setAgentName}
          handleAssignLead={handleAssignLead}
          assignButtonDisable={!(buttonState[0]?.ids?.length && agentName)}
          unassignButtonDisable={!buttonState[1].unassign}
          assignType={assignType as TypeAssign}
          totalItem={totalItem}
          assignLoading={assignLoading}
          confirmAssigned={confirmAssigned}
          setShowConfirmModal={setShowConfirmModal}
          showConfirmModal={showConfirmModal}
        />
      )}
      {isReject ? rejectButtons() : null}
      <Grid
        item
        xs={12}
        md={isReject ? 6 : 12}
        lg={responsivePaging(Breakpoints.lg)}
        xl={responsivePaging(Breakpoints.xl)}
        className="dp-flex paging-my-leads top-paging"
      >
        <div className="paging">{children}</div>
      </Grid>
    </Grid>
  );
}

export default TableAllLeadButton;
