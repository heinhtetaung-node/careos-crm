import { Button } from '@alphafounders/ui';
import { Formik, Form } from 'formik';
import React, { useState, useEffect } from 'react';

import { LeadTypeFilter, ProductTypeFilter } from 'config/TypeFilter';
import { useLazyGetAllInsurersByStreamingQuery } from 'data/slices/insurerSlice';
import { Team } from 'data/slices/leadSearchSlice/interface';
import {
  useGetRolesQuery,
  useLazyGetTeamDetailQuery,
  useUpdateTeamMutation,
  useAddTeamMutation,
} from 'data/slices/teamSlice';
import { useLazyGetUsersQuery } from 'data/slices/userSlice';
import Autocomplete from 'presentation/components/controls/Autocomplete/Autocomplete';
import Input from 'presentation/components/controls/Input';
import { userRolesText } from 'presentation/pages/admin/users/userPageHelper';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import TeamRole from 'shared/constants/teamRole';
import {
  ICreateTeamNew,
  IUpdateTeam,
} from 'shared/interfaces/common/admin/team';
import { SelectElement } from 'shared/types/controls';
import useSnackbar from 'utils/snackbar';

import buildValidationSchema from './helper';

interface ICreateAdminProps {
  readonly data: Team | null;
  close: () => void;
  setShouldFetch: (value: boolean) => void;
}

const SALE_AND_INBOUND: TeamRole[] = [TeamRole.Sales, TeamRole.Inbound];

function CreateTeam({ data, close, setShouldFetch }: ICreateAdminProps) {
  const [buttonText, setButtonText] = useState(getString('text.createTeam'));
  const [formData, setFormData] = useState({
    teamRole: {},
    insurer: [],
    name: null,
    teamName: '',
    product: {},
    leadType: {},
    manager: {},
    supervisor: {},
  });
  const [isEdit, setIsEdit] = useState(false);
  const [isSaleOrInbound, setIsSaleOrInbound] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  // Using pagesize as 50 as we dont have that many teams.
  const { data: allRoles } = useGetRolesQuery({
    pageSize: 50,
  });

  const [
    updateTeam,
    { isSuccess: updateTeamSuccess, isError: updateTeamError },
  ] = useUpdateTeamMutation();

  const [addTeam, { isSuccess: addTeamSuccess, isError: addTeamError }] =
    useAddTeamMutation();

  // Fetch managers
  const [getManagers, { data: managerData, isLoading: isManagerDataLoading }] =
    useLazyGetUsersQuery();

  const getAllManagers = () =>
    getManagers(`pageSize=100&filter=${CONSTANTS.userFilter.manager}`, true);

  // Fetch supervisors
  const [
    getSupervisors,
    { data: supervisorData, isLoading: isSupervisorDataLoading },
  ] = useLazyGetUsersQuery();

  const getAllSupervisors = () =>
    getSupervisors(
      `pageSize=100&filter=${CONSTANTS.userFilter.supervisor}`,
      true
    );

  const [getInsurers, { data: insurerData, isLoading: isInsurersDataLoading }] =
    useLazyGetAllInsurersByStreamingQuery();

  const getAllInsurers = () => getInsurers({ pageSize: 200 }, true);

  const [getTeamDetail, { data: teamDetail }] = useLazyGetTeamDetailQuery();

  // if add and update successful show snackbar
  useEffect(() => {
    if (updateTeamSuccess || addTeamSuccess) {
      setIsLoading(true);
      if (updateTeamSuccess) {
        // show snackbar
        showSuccessSnackbar(getString('text.updateTeamSuccessfully'));
      }
      if (addTeamSuccess) {
        // show snackbar
        showSuccessSnackbar(getString('text.createTeamSuccess'));
      }

      setTimeout(() => {
        setIsLoading(false);
        setShouldFetch(true);
        close();
      }, 2000);
    }
  }, [updateTeamSuccess, addTeamSuccess, showSuccessSnackbar]);

  // if add and update has error show error snackbar
  useEffect(() => {
    if (updateTeamError || addTeamError) {
      if (updateTeamError) {
        // show snackbar
        showErrorSnackbar(getString('text.updateTeamFail'));
      }
      if (addTeamError) {
        // show snackbar
        showErrorSnackbar(getString('text.createTeamFail'));
      }
      close();
    }
  }, [updateTeamError, addTeamError, showErrorSnackbar]);

  // Trigger unsubscribe on unmount for cache data for the endpoints below.
  useEffect(
    () => () => {
      getAllManagers().unsubscribe();
      getAllSupervisors().unsubscribe();
      getAllInsurers().unsubscribe();
    },
    []
  );

  useEffect(() => {
    setShouldFetch(false);
  }, []);

  const localeLeadTypeFilter = LeadTypeFilter.map((type: any) => ({
    ...type,
    title: getString(type.title),
  }));

  const formattedRoleData = allRoles?.roles?.map((role: any) => ({
    ...role,
    title: userRolesText(role.name),
    value: role.name,
  }));

  const getOptionFromValue = (
    value: string,
    options: any = [],
    field = 'value'
  ) => {
    if (!options && typeof options !== 'object') return null;
    return options.filter((option: any) => option[field] === value)[0];
  };

  const handleCloseButton = () => {
    close();
  };

  // If edit fetch details about the team
  useEffect(() => {
    if (data?.name) {
      getTeamDetail(data.name);
    }
  }, [data]);

  // If edit call the api based on if there is value in teamDetail
  useEffect(() => {
    if (teamDetail) {
      if (teamDetail.insurers?.length) {
        getAllInsurers();
      }
      if (teamDetail.manager) {
        getAllManagers();
      }
      if (teamDetail.supervisor) {
        getAllSupervisors();
      }
    }
  }, [teamDetail]);

  useEffect(() => {
    if (
      teamDetail &&
      !isManagerDataLoading &&
      !isSupervisorDataLoading &&
      !isInsurersDataLoading
    ) {
      setIsEdit(true);
    }
  }, [
    teamDetail,
    isManagerDataLoading,
    isSupervisorDataLoading,
    isInsurersDataLoading,
  ]);

  // this is for pre populate form if user tries to edit
  useEffect(() => {
    if (teamDetail && isEdit && allRoles && managerData && supervisorData) {
      setButtonText(getString('text.updateTeam'));

      const body = {
        teamRole:
          teamDetail && allRoles
            ? getOptionFromValue(teamDetail.role, formattedRoleData)
            : null,
        insurer: teamDetail.insurers.map((insurer: string) =>
          getOptionFromValue(insurer, insurerData?.insurers, 'displayName')
        ),
        name: teamDetail.name,
        teamName: teamDetail.displayName,
        product: getOptionFromValue(teamDetail.productType, ProductTypeFilter),
        leadType: getOptionFromValue(teamDetail.leadType, localeLeadTypeFilter),
        manager: getOptionFromValue(teamDetail.manager, managerData?.users),
        supervisor: getOptionFromValue(
          teamDetail.supervisor,
          supervisorData?.users
        ),
      };

      setIsSaleOrInbound(
        teamDetail?.role
          ? !!SALE_AND_INBOUND.includes(teamDetail.role as TeamRole)
          : false
      );
      setFormData(body as any);
    }
  }, [teamDetail, isEdit, managerData, supervisorData]);

  const handleSubmit = (values: any) => {
    if (!values) return;

    if (isEdit) {
      const editTeamModel: IUpdateTeam = {
        displayName: values.teamName?.trim(),
        productType: values.product?.value || null,
        leadType: values.leadType?.value,
        manager: values.manager?.value,
        supervisor: values.supervisor?.value,
        insurers: values.insurer?.map((item: any) => item.displayName),
      };

      updateTeam({
        teamData: editTeamModel,
        teamId: values.name,
      });
    } else {
      const addTeamModel: ICreateTeamNew = {
        displayName: values.teamName?.trim(),
        productType: values.product?.value,
        leadType: values.leadType?.value,
        manager: values.manager?.value,
        supervisor: values.supervisor?.value,
        role: values.teamRole?.name,
        insurers: values.insurer?.map((item: any) => item.displayName),
      };

      addTeam(addTeamModel);
    }
  };

  const onChangeRole = (event: React.ChangeEvent<SelectElement>) => {
    const role: any = event?.target?.value;
    if (role) {
      setIsSaleOrInbound(SALE_AND_INBOUND.includes(role.value as TeamRole));
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        teamRole: formData.teamRole,
        name: formData.name,
        insurer: formData.insurer,
        teamName: formData.teamName,
        product: formData.product,
        supervisor: formData.supervisor,
        leadType: formData.leadType,
        manager: formData.manager,
      }}
      onSubmit={handleSubmit}
      validationSchema={buildValidationSchema(SALE_AND_INBOUND)}
    >
      {(props) => {
        const { values, errors, isValid, dirty, handleChange } = props;
        return (
          <Form className="w-full min-w-[350px]" data-testid="team-modal-new">
            <div className="mb-2 w-full">
              <Autocomplete
                testid="teamRole-autocomplete"
                multiple={false}
                label={getString('text.teamRole')}
                name="teamRole"
                value={values.teamRole}
                onChange={(event) => {
                  handleChange(event);
                  onChangeRole(event);
                }}
                options={formattedRoleData ?? []}
                title="title"
                key="value"
                disabled={isEdit}
                fixedLabel
              />
            </div>

            {isSaleOrInbound === false && (
              <div className="mt-3 mb-2 w-full">
                <Autocomplete
                  testid="insurer-autocomplete"
                  disableClearable
                  label={getString('text.insurer')}
                  name="insurer"
                  value={values.insurer}
                  onChange={handleChange}
                  options={[]}
                  labelField="shortnameEn"
                  valueField="displayName"
                  hasSelectAll
                  fixedLabel
                  onFocusFn={getAllInsurers}
                  apiDataField="insurers"
                  loading={isInsurersDataLoading}
                  missingId
                  idField="name"
                  limitTags={3}
                />
              </div>
            )}
            <div className="mt-3 mb-2 w-full">
              <Input
                dataTestid="teamName-input"
                label={getString('text.teamName')}
                name="teamName"
                value={values.teamName}
                onChange={handleChange}
                className="team-name-field"
                fixedLabel
              />
            </div>
            <div className="mt-3 mb-2 w-full">
              <Autocomplete
                testid="product-autocomplete"
                disableClearable
                options={ProductTypeFilter}
                label={getString('text.product')}
                name="product"
                value={values.product}
                onChange={handleChange}
                multiple={false}
                fixedLabel
              />
            </div>
            {isSaleOrInbound && (
              <div className="mt-3 mb-2 w-full">
                <Autocomplete
                  testid="leadType-autocomplete"
                  disableClearable
                  options={localeLeadTypeFilter}
                  label={getString('text.leadType')}
                  name="leadType"
                  value={values.leadType}
                  onChange={handleChange}
                  multiple={false}
                  fixedLabel
                />
              </div>
            )}
            <div className="mt-3 mb-2 w-full">
              <Autocomplete
                testid="manager-autocomplete"
                disableClearable
                options={[]}
                label={getString('text.manager')}
                name="manager"
                value={values.manager}
                onChange={handleChange}
                multiple={false}
                fixedLabel
                onFocusFn={getAllManagers}
                apiDataField="users"
                loading={isManagerDataLoading}
              />
            </div>
            <div className="mt-3 mb-2 w-full">
              <Autocomplete
                testid="supervisor-autocomplete"
                disableClearable
                options={[]}
                label={getString('text.supervisor')}
                name="supervisor"
                value={values.supervisor}
                onChange={handleChange}
                multiple={false}
                fixedLabel
                onFocusFn={getAllSupervisors}
                apiDataField="users"
                loading={isSupervisorDataLoading}
              />
            </div>
            <div className="flex align-end justify-end pt-3">
              <Button
                dataTestId="cancel-button"
                className="px-5 py-3 mr-1"
                variant="secondary"
                text={getString('text.cancelButton')}
                onClick={() => handleCloseButton()}
              />
              <Button
                dataTestId="submit-button"
                className="px-5 py-3 ml-1"
                variant="primary"
                disabled={
                  Object.keys(errors).length > 0 ||
                  !isValid ||
                  !dirty ||
                  isLoading
                }
                text={buttonText}
                onClick={() => handleSubmit(values)}
              />
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

export default CreateTeam;
