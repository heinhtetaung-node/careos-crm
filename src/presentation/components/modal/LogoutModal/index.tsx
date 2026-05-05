import { FormControl, Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import './index.scss';

import {
  INITIAL_LOGOUT_STATUS,
  LEAVE_TYPE,
  LOGOUT_STATUS,
} from './logout.helper';

import { logoutUser } from '../../../redux/actions/presence';
import { getString } from '../../../theme/localization';
import Controls from '../../controls/Control';

const CustomFormControl = styled(FormControl)`
  width: 70%;
  margin: auto;
  .action-btn {
    button {
      color: #ffff;
      font-weight: bold;
    }
  }
`;
interface IProps {
  closeModal: () => void;
}

function LogoutModal({ closeModal }: IProps) {
  const dispatch = useDispatch();
  const { data: user } = useGetAuthenticateQuery();
  const { isLogoutSuccess } = useSelector(
    (state: any) => state.presenceReducer
  );
  const [logoutType, setLogoutType] = useState(INITIAL_LOGOUT_STATUS);
  useEffect(() => {
    if (isLogoutSuccess) {
      closeModal();
    }
  }, [isLogoutSuccess, closeModal]);
  const logoutUserHandle = () => {
    const logoutBody = {
      status: LEAVE_TYPE.STATUS_AWAY,
      interactTime: new Date().toISOString(),
      awayReason: logoutType,
    };
    dispatch(logoutUser(logoutBody, user?.name));
  };

  const selectLogoutType = (event: any) => {
    setLogoutType(event.target.value);
  };

  const localeLogoutStatus = LOGOUT_STATUS.map((status: any) => ({
    ...status,
    title: getString(`logoutOption.${status.value}`),
  }));

  return (
    <div className="logout-modal">
      <CustomFormControl>
        <Controls.Select
          label={getString('text.status')}
          value={logoutType}
          onChange={selectLogoutType}
          options={localeLogoutStatus}
          selectField="value"
          fixedLabel
          placeholder={getString('text.select')}
          id="status-native-simple"
          className="select-status"
        />
        <Grid item xs={12} md={12}>
          <div className="button-list">
            <Controls.Button
              text={getString('text.cancelButton')}
              color="secondary"
              variant="text"
              onClick={() => closeModal()}
            />
            <Controls.Button
              text={getString('text.logout')}
              color="primary"
              onClick={logoutUserHandle}
              disabled={logoutType === INITIAL_LOGOUT_STATUS}
            />
          </div>
        </Grid>
      </CustomFormControl>
    </div>
  );
}
export default LogoutModal;
