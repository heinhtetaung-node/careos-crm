/* eslint-disable react-hooks/exhaustive-deps */
import { FormControl, Grid } from '@material-ui/core';
import { Formik, Form } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { useLazyGetUserRecoveryLinkQuery } from 'data/slices/userSlice';
import Controls from 'presentation/components/controls/Control';
import Loader from 'presentation/components/Loader';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { userRolesText } from 'presentation/pages/admin/users/userPageHelper';
import {
  createUser,
  editUser,
  deleteUser,
  unDeleteUser,
  getTeamByUser,
  clearProduct,
} from 'presentation/redux/actions/admin/user';
import { getProductSelectorTypes } from 'presentation/redux/actions/typeSelector/product';
import { getRoleSelectorTypes } from 'presentation/redux/actions/typeSelector/role';
import {
  getTeamSelectorTypes,
  getAllTeams,
} from 'presentation/redux/actions/typeSelector/team';
import { hideModal } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { languages } from 'shared/helper/utilities';
import { ICreateUser } from 'shared/interfaces/common/admin/user';
import { IGetRoleSelector } from 'shared/interfaces/common/typeSelector/role';
import { IGetTeamList } from 'shared/interfaces/common/typeSelector/team';
import { SelectElement } from 'shared/types/controls';
import useSnackbar from 'utils/snackbar';

import {
  scores,
  getInitialUser,
  createValidationSchema,
} from './CreateUser.helper';

import Button from '../../components/Button';

import './createUser.scss';

const SALES_AGENT = UserRoleID.SalesAgent;
const PAGE_SIZE = 15;
const MIN_NUMBER_INPUT_TYPE = 0;
const BACK_OFFICE_ROLES = [
  UserRoleID.CustomerService,
  UserRoleID.DocumentsCollection,
  UserRoleID.QualityControl,
  UserRoleID.Submission,
];
interface IInitialUser {
  [key: string]: string | number | boolean | any;
}
interface IConditon {
  isSalesAgent: boolean;
  isBackOffice: boolean;
  isChangeTeam: boolean;
  name: string;
  teamMember: string;
  team: string;
  isAddNewMember: boolean;
}
interface ICreateUserProps {
  user: any;
  typeSelector: any;
  userSelector: any;
  onCancel?: () => void;
  getProductSelectorTypes: () => void;
  getTeamSelectorTypes: (payload: IGetTeamList) => void;
  getRoleSelectorTypes: (payload: IGetRoleSelector) => void;
  hideModal: (payload: string) => void;
  createUser: (
    payload: ICreateUser,
    isSalesAgent: boolean,
    isBackOffice: boolean,
    team: string
  ) => void;
  editUser: (payload: ICreateUser, condition: IConditon) => void;
  getTeamByUser: (payload: string) => void;
  getAllTeams: (payload: any) => void;
  isEdit: boolean;
  deleteUser: (payload: string) => void;
  unDeleteUser: (payload: string) => void;
  clearProduct: () => void;
}

// eslint-disable-next-line react/function-component-definition
const CreateUser: React.FC<ICreateUserProps> = ({
  typeSelector,
  userSelector,
  user,
  onCancel,
  getProductSelectorTypes: handleGetProductSelectorTypes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTeamSelectorTypes: handleGetTeamSelectorTypes,
  getRoleSelectorTypes: handleGetRoleSelectorTypes,
  hideModal: handleHideModal,
  createUser: handleCreateUser,
  editUser: handleEditUser,
  getTeamByUser: handleGetTeamByUser,
  getAllTeams: handleGetTeamsByRole,
  isEdit,
  deleteUser: handleDeleteUser,
  unDeleteUser: handleUndeleteUser,
  clearProduct: handleClearProduct,
}) => {
  const [isSalesAgent, setIsSaleAgent] = useState<boolean>(false);
  const [isBackOffice, setIsBackOffice] = useState<boolean>(false);
  const [initialUser, setInitialUser] = useState<IInitialUser>();
  const [oldTeam, setOldTeam] = useState<string>('');
  const [getUserRecoveryLink] = useLazyGetUserRecoveryLinkQuery();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const roleSelectors = typeSelector.roleSelectorReducer.data?.roles || [];
  const localeRoles = useMemo(
    () =>
      roleSelectors.map((role: any) => ({
        ...role,
        title: userRolesText(role.name),
      })),
    [roleSelectors]
  );
  const teamSelectors = (
    typeSelector.allTeamsSelectorReducer.data?.teams || []
  ).map((item: any) => ({
    ...item,
    title: item.displayName,
  }));

  const currentUserTeam =
    userSelector.editUserReducer.currentTeamMemberName || null;

  const handleClose = () => {
    onCancel?.();
    handleHideModal(CONSTANTS.ModalConfig.userModal);
  };

  const handleSubmit = (values: any) => {
    const userModel: ICreateUser = {
      humanId: values.humanId.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      role: values.role,
      annotations: {
        lang: values.language,
      },
    };

    if (isSalesAgent) {
      userModel.annotations = {
        ...userModel.annotations,
        daily_limit: values.dailyLimit.toString(),
        score: values.agentScore.toString(),
        total_limit: values.totalLimit.toString(),
      };
    }

    if (isEdit) {
      const condition: IConditon = {
        isSalesAgent,
        isBackOffice,
        name: values.name,
        teamMember: currentUserTeam,
        team: values.team,
        isChangeTeam: false,
        isAddNewMember: false,
      };
      if (values.team !== oldTeam && oldTeam) {
        condition.isChangeTeam = true;
      }
      if (values.team !== oldTeam && !oldTeam) {
        condition.isAddNewMember = true;
      }

      handleEditUser(userModel, condition);
    } else {
      handleCreateUser(userModel, isSalesAgent, isBackOffice, values.team);
    }
  };

  const handleDeleteUserButton = () => {
    if (user.deleteTime === null) {
      handleDeleteUser(user.name);
    } else {
      handleUndeleteUser(user.name);
    }
  };

  const handleRecoveryLinkButton = async () => {
    const getRecoveryLink = await getUserRecoveryLink(user.name).unwrap();
    const recoveryLink = getRecoveryLink?.recoveryLink;
    if (!recoveryLink) {
      showErrorSnackbar(getString('text.errorGettingRecoveryLink'));
      return;
    }
    await navigator.clipboard.writeText(recoveryLink);
    showSuccessSnackbar(getString('text.copiedRecoveryLinkToClipboard'));
  };

  const handleGetTypeSelector = () => {
    handleGetProductSelectorTypes();
    if (!roleSelectors.length) {
      handleGetRoleSelectorTypes({
        pageSize: PAGE_SIZE,
      });
    }
  };

  useEffect(() => {
    handleGetTypeSelector();
    handleClearProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRoleHandle = (role: string) => {
    setIsSaleAgent(role === SALES_AGENT);
    setIsBackOffice(BACK_OFFICE_ROLES.includes(role as UserRoleID));

    const filterTeamByRole = {
      filter: `role="${role}"`,
      pageSize: 100,
    };
    handleGetTeamsByRole(filterTeamByRole);
  };

  const onChangeRole = (event: React.ChangeEvent<SelectElement>) => {
    changeRoleHandle(event.target.value as string);
  };

  useEffect(() => {
    const team = userSelector.editUserReducer.currentTeam;
    setOldTeam(team);
    setInitialUser({
      ...initialUser,
      team: userSelector.editUserReducer.currentTeam,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSelector.editUserReducer.currentTeam]);

  useMemo(() => {
    if (isEdit) {
      const { role, name } = user;
      const teamFilter = encodeURI(`filter=user="${name}"`);
      if (role) {
        changeRoleHandle(role);
        handleGetTeamByUser(teamFilter);
      }
      setInitialUser({
        ...user,
        product: '',
        team: '',
        dailyLimit: user.annotations?.daily_limit,
        agentScore: user.annotations?.score,
        totalLimit: user.annotations?.total_limit,
        language: user.annotations?.lang,
      });
      return;
    }
    setInitialUser(getInitialUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createFormSchema = () =>
    createValidationSchema(SALES_AGENT, BACK_OFFICE_ROLES);

  if (!teamSelectors) {
    return <Loader />;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialUser as IInitialUser}
      onSubmit={handleSubmit}
      validationSchema={createFormSchema}
    >
      {(props) => {
        const {
          values,
          isValid,
          dirty,
          handleChange,
          handleBlur,
          setFieldValue,
        } = props;
        return (
          <Form className="user-create-user">
            <FormControl margin="normal" required>
              <Controls.Select
                options={localeRoles}
                label={getString('text.userRole')}
                name="role"
                key="name"
                title="displayName"
                selectField="name"
                value={values.role}
                onChange={(event) => {
                  // Clear team field when role change
                  values.team = '';
                  onChangeRole(event);
                  handleChange(event);
                }}
                disabled={isEdit && user?.deleteTime}
              />
            </FormControl>

            <FormControl margin="normal" required>
              <Controls.Input
                label={getString('text.firstName')}
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isEdit && user?.deleteTime}
              />
            </FormControl>

            <FormControl margin="normal" required>
              <Controls.Input
                label={getString('text.lastName')}
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isEdit && user?.deleteTime}
              />
            </FormControl>

            <FormControl margin="normal" required>
              <Controls.Input
                label={getString('text.userName')}
                name="humanId"
                value={values.humanId}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isEdit || false}
              />
            </FormControl>
            {(isSalesAgent || isBackOffice) && (
              <FormControl margin="normal" required>
                <Controls.Select
                  options={teamSelectors || []}
                  label={getString('text.team')}
                  name="team"
                  key="name"
                  title="displayName"
                  selectField="name"
                  value={values.team}
                  onChange={handleChange}
                  disabled={
                    (isEdit && user?.deleteTime) || !teamSelectors.length
                  }
                />
              </FormControl>
            )}
            {isSalesAgent && (
              <>
                <FormControl margin="normal" required>
                  <Controls.Input
                    label={getString('text.dailyLimit')}
                    name="dailyLimit"
                    type="number"
                    value={values.dailyLimit}
                    step={1}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(event);
                      // eslint-disable-next-line radix
                      setFieldValue('dailyLimit', parseInt(event.target.value));
                    }}
                    onBlur={handleBlur}
                    inputProps={{ min: MIN_NUMBER_INPUT_TYPE }}
                    disabled={isEdit && user?.deleteTime}
                  />
                </FormControl>
                <FormControl margin="normal" required>
                  <Controls.Input
                    label={getString('text.totalLeadLimit')}
                    name="totalLimit"
                    type="number"
                    value={values.totalLimit}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(event);
                      // eslint-disable-next-line radix
                      setFieldValue('totalLimit', parseInt(event.target.value));
                    }}
                    onBlur={handleBlur}
                    inputProps={{ min: MIN_NUMBER_INPUT_TYPE }}
                    disabled={isEdit && user?.deleteTime}
                  />
                </FormControl>
                <FormControl margin="normal">
                  <Controls.Select
                    options={scores || []}
                    label={getString('text.agentScore')}
                    name="agentScore"
                    value={values.agentScore}
                    onChange={handleChange}
                    disabled={isEdit && user?.deleteTime}
                  />
                </FormControl>
              </>
            )}
            <FormControl margin="normal">
              <Controls.Select
                options={languages || []}
                label={getString('leadDetailFields.language')}
                name="language"
                selectField="value"
                value={values.language}
                onChange={handleChange}
                disabled={isEdit && user?.deleteTime}
              />
            </FormControl>
            <Grid container justifyContent="space-between">
              {isEdit ? (
                <div className="button-group">
                  <Button
                    className="btn-suspend"
                    onClick={handleDeleteUserButton}
                  >
                    {getString(
                      user.deleteTime !== null
                        ? 'text.activate'
                        : 'text.suspend'
                    )}
                  </Button>
                  <Button
                    className="btn-recovery"
                    disabled={
                      initialUser?.status
                        ? initialUser?.status !== 'Active'
                        : Boolean(initialUser?.deleteTime)
                    }
                    onClick={handleRecoveryLinkButton}
                    data-testid="recovery-link-button"
                  >
                    {getString('text.recoveryLink')}
                  </Button>
                </div>
              ) : (
                <div />
              )}

              <div className="button-group">
                <Controls.Button
                  type="button"
                  color="secondary"
                  variant="text"
                  onClick={handleClose}
                  text={getString('text.cancelButton')}
                />
                {!user?.deleteTime && (
                  <Controls.Button
                    type="submit"
                    color="primary"
                    className="button-save"
                    disabled={!(isValid && dirty)}
                    text={
                      isEdit
                        ? getString('text.update')
                        : getString('text.create')
                    }
                  />
                )}
              </div>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

const mapStateToProps = (state: any) => ({
  typeSelector: state.typeSelectorReducer,
  userSelector: state.userReducer,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      createUser,
      editUser,
      getProductSelectorTypes,
      getTeamSelectorTypes,
      getRoleSelectorTypes,
      hideModal,
      deleteUser,
      unDeleteUser,
      getTeamByUser,
      getAllTeams,
      clearProduct,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateUser);
