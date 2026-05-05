import { Button } from '@alphafounders/ui';
import { Formik, Form } from 'formik';
import _get from 'lodash/get';
import React, { useEffect, useState } from 'react';

import { useLazyGetTeamsQuery } from 'data/slices/teamSlice';
import {
  useLazyGetUserRecoveryLinkQuery,
  useGetUserRolesQuery,
} from 'data/slices/userSlice';
import Autocomplete from 'presentation/components/controls/Autocomplete/Autocomplete';
import Input from 'presentation/components/controls/Input';
import {
  RolesWithoutProduct,
  UserRoleID,
} from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';
import { languages } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';

import {
  scores,
  createValidationSchema,
  ProductTypeOptions,
  handleRoleChange,
} from './helper';
import { IInitialUser, ICreateUserProps } from './interface';
import useUserModalLogic from './useUserModalLogics';

import { PRODUCTS } from 'config/TypeFilter';

function CreateUser({
  userData,
  onClose,
  isEdit = true,
  setShouldFetch,
}: Readonly<ICreateUserProps>) {
  const RolesWithAllFields = [UserRoleID.SalesAgent];
  const RolesWithLicenseField = [UserRoleID.Supervisor, UserRoleID.SalesAgent];
  const RolesWithTeamsField = [
    UserRoleID.SalesAgent,
    UserRoleID.CustomerService,
    UserRoleID.DocumentsCollection,
    UserRoleID.QualityControl,
    UserRoleID.Submission,
  ];

  const {
    apiStatuses: {
      isAddingUserLoading,
      isUpdateUserLoading,
      isDeleteUserLoading,
      isUnDeleteUserLoading,
    },
    handleDeleteUserButton,
    handleSubmitClick,
  } = useUserModalLogic({
    RolesWithTeamsField,
    RolesWithAllFields,
    RolesWithLicenseField,
    onClose,
    setShouldFetch,
    userData,
  });

  const { data: allRoles, isLoading: isRolesLoading } = useGetUserRolesQuery({
    pageSize: 100,
  });

  const [getTeams, { data: teamsData, isLoading: isTeamsLoading }] =
    useLazyGetTeamsQuery();

  const [getUserRecoveryLink] = useLazyGetUserRecoveryLinkQuery();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [initialUser, setInitialUser] = useState<IInitialUser>({
    role: {},
    firstName: undefined,
    lastName: undefined,
    humanId: undefined,
    team: {},
    dailyLimit: undefined,
    totalLimit: undefined,
    agentScore: {},
    language: {},
    product: {},
  });
  const [originalTeam, setOriginalTeam] = useState<string>('');

  const getTeamsWithUserRole = (userRole: string) =>
    getTeams({
      pageSize: 100,
      filter: `role="${userRole}"`,
    });

  const getOptionFromValue = (
    value: string,
    options: any = [],
    field = 'value'
  ) => {
    if (!options && typeof options !== 'object') return null;
    return options.filter((option: any) => option[field] === value)[0];
  };

  useEffect(() => {
    async function setUserData() {
      if (isEdit && userData) {
        const initialUserData = {
          role: userData.role
            ? getOptionFromValue(userData.role, allRoles?.roles, 'name')
            : {},
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          humanId: userData.humanId,
          team: {},
          dailyLimit: userData?.annotations?.daily_limit,
          totalLimit: userData?.annotations?.total_limit,
          product: userData?.product
            ? getOptionFromValue(userData?.product, ProductTypeOptions)
            : {},
          agentScore: userData?.annotations?.score
            ? getOptionFromValue(userData?.annotations?.score, scores)
            : {},
          licenseNo: userData?.annotations?.license_no,
          licenseIssueDate: userData?.annotations?.license_issue_date,
          licenseExpiryDate: userData?.annotations?.license_expiry_date,
          language: userData?.annotations?.lang
            ? getOptionFromValue(userData?.annotations?.lang, languages)
            : {},
        };

        if (userData?.teamDisplayName) {
          await getTeamsWithUserRole(userData.role).then((response: any) => {
            const teamsResponseData = _get(response, 'data', {});
            const userTeamValue = getOptionFromValue(
              userData.teamDisplayName,
              teamsResponseData,
              'displayName'
            );
            setOriginalTeam(userTeamValue?.name);
            initialUserData.team = userTeamValue;
          });
        }

        if (
          !initialUserData?.product ||
          Object.keys(initialUserData?.product).length === 0
        ) {
          if (RolesWithoutProduct.includes(userData?.role)) {
            initialUserData.product = getOptionFromValue(
              PRODUCTS.CAR_PRODUCT_INSURANCE,
              ProductTypeOptions
            );
          } else {
            initialUserData.product = {};
          }
        }
        setInitialUser(initialUserData);
      }
    }

    setUserData();
  }, [isEdit, userData, allRoles, teamsData]);

  const handleRecoveryLinkButton = async () => {
    const getRecoveryLink = await getUserRecoveryLink(userData.name).unwrap();
    const recoveryLink = getRecoveryLink?.recoveryLink;
    if (!recoveryLink) {
      showErrorSnackbar(getString('text.errorGettingRecoveryLink'));
      return;
    }
    await navigator.clipboard.writeText(recoveryLink);
    showSuccessSnackbar(getString('text.copiedRecoveryLinkToClipboard'));
  };

  const createFormSchema = () =>
    createValidationSchema(RolesWithTeamsField, UserRoleID.SalesAgent);

  return (
    <Formik
      enableReinitialize
      initialValues={initialUser}
      onSubmit={(allValues: any) =>
        handleSubmitClick(isEdit, originalTeam, allValues)
      }
      validationSchema={createFormSchema}
    >
      {(props) => {
        const {
          values,
          isValid,
          dirty,
          handleChange,
          handleBlur,
          errors,
          setFieldValue,
        } = props;

        const onRoleChange = (event: any, _value: any) => {
          handleRoleChange(event, setFieldValue, handleChange);
        };

        return (
          <Form className="min-w-[450px]">
            <div className="mt-0 mb-2 w-full">
              <Autocomplete
                multiple={false}
                testid="userRole-autocomplete"
                disableClearable
                label={getString('text.userRole')}
                name="role"
                value={values.role}
                onChange={onRoleChange}
                options={allRoles?.roles || []}
                labelField="displayName"
                valueField="name"
                fixedLabel
                missingId
                limitTags={1}
                loading={isRolesLoading}
                disabled={isEdit && userData?.deleteTime}
              />
            </div>

            <div className="mt-3 mb-2 w-full">
              <Input
                dataTestid="firstName-input"
                label={getString('text.firstName')}
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                fixedLabel
                disabled={isEdit && userData?.deleteTime}
              />
            </div>
            <div className="mt-3 mb-2 w-full">
              <Input
                dataTestid="lastName-input"
                label={getString('text.lastName')}
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                fixedLabel
                disabled={isEdit && userData?.deleteTime}
              />
            </div>
            <div className="mt-3 mb-2 w-full">
              <Input
                dataTestid="userName-input"
                label={getString('text.userName')}
                name="humanId"
                value={values.humanId}
                onChange={handleChange}
                onBlur={handleBlur}
                fixedLabel
                disabled={isEdit}
                error={errors.humanId}
              />
            </div>
            {RolesWithTeamsField.includes(values?.role?.name as UserRoleID) && (
              <div className="mt-3 mb-2 w-full">
                <Autocomplete
                  multiple={false}
                  testid="team-autocomplete"
                  disableClearable
                  label={getString('text.team')}
                  name="team"
                  value={values.team}
                  onChange={handleChange}
                  options={[]}
                  labelField="displayName"
                  valueField="name"
                  fixedLabel
                  onFocusFn={() => getTeamsWithUserRole(values.role.name)}
                  missingId
                  loading={isTeamsLoading}
                  limitTags={1}
                  disabled={isEdit && userData?.deleteTime}
                />
              </div>
            )}
            {RolesWithAllFields.includes(values?.role?.name as UserRoleID) && (
              <>
                <div className="mt-3 mb-2 w-full">
                  <Input
                    dataTestid="dailyLimit-input"
                    label={getString('text.dailyLimit')}
                    name="dailyLimit"
                    type="number"
                    step={1}
                    value={values.dailyLimit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fixedLabel
                    disabled={isEdit && userData?.deleteTime}
                  />
                </div>
                <div className="mt-3 mb-2 w-full">
                  <Input
                    dataTestid="totalLimit-input"
                    label={getString('text.totalLeadLimit')}
                    name="totalLimit"
                    type="number"
                    step={1}
                    value={values.totalLimit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fixedLabel
                    disabled={isEdit && userData?.deleteTime}
                  />
                </div>
                <div className="mt-3 mb-2 w-full">
                  <Autocomplete
                    multiple={false}
                    testid="agentScore-autocomplete"
                    disableClearable
                    label={getString('text.agentScore')}
                    name="agentScore"
                    value={values.agentScore}
                    onChange={handleChange}
                    options={scores || []}
                    labelField="title"
                    valueField="value"
                    fixedLabel
                    limitTags={1}
                    disabled={isEdit && userData?.deleteTime}
                  />
                </div>
              </>
            )}
            {RolesWithLicenseField.includes(
              values?.role?.name as UserRoleID
            ) && (
              <>
                <div className="mt-3 mb-2 w-full">
                  <Input
                    dataTestid="license-no-input"
                    label={getString('text.licenseNo')}
                    name="licenseNo"
                    type="text"
                    value={values.licenseNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fixedLabel
                    disabled={isEdit && userData?.deleteTime}
                    error={errors.licenseNo}
                  />
                </div>
                <div className="mt-3 mb-2 w-full">
                  <Input
                    dataTestid="license-start-date-input"
                    label={getString('dateType.licenseIssueDate')}
                    name="licenseIssueDate"
                    type="date"
                    value={values.licenseIssueDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fixedLabel
                    disabled={isEdit && userData?.deleteTime}
                  />
                </div>
                <div className="mt-3 mb-2 w-full">
                  <Input
                    dataTestid="license-end-date-input"
                    label={getString('dateType.licenseExpiryDate')}
                    name="licenseExpiryDate"
                    type="date"
                    value={values.licenseExpiryDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fixedLabel
                    disabled={isEdit && userData?.deleteTime}
                  />
                </div>
              </>
            )}
            <div className="mt-3 mb-2 w-full">
              {!RolesWithoutProduct.includes(
                values?.role?.name as UserRoleID
              ) && (
                <Autocomplete
                  isEditable
                  multiple={false}
                  testid="product-type"
                  disableClearable
                  label={getString('leadDetailFields.productType')}
                  name="product"
                  value={values.product}
                  onChange={handleChange}
                  options={ProductTypeOptions}
                  labelField="title"
                  valueField="value"
                  fixedLabel
                  limitTags={1}
                  disabled={isEdit && userData?.deleteTime}
                />
              )}
              <br />
              <Autocomplete
                multiple={false}
                testid="language-autocomplete"
                disableClearable
                label={getString('leadDetailFields.language')}
                name="language"
                value={values.language}
                onChange={handleChange}
                options={languages}
                labelField="title"
                valueField="value"
                fixedLabel
                limitTags={1}
                disabled={isEdit && userData?.deleteTime}
              />
            </div>
            <div className="flex justify-between pt-3">
              {isEdit ? (
                <div className="flex">
                  <Button
                    variant="secondary"
                    className="text-red-400 bg-white border-red-400 px-2 py-2 ml-0 mr-1 font-bold"
                    onClick={handleDeleteUserButton}
                    data-testid="suspend-activate-user-button"
                    text={getString(
                      userData?.deleteTime !== null
                        ? 'text.activate'
                        : 'text.suspend'
                    )}
                    disabled={isDeleteUserLoading || isUnDeleteUserLoading}
                  />
                  <Button
                    className="px-2 py-2 ml-1"
                    text={getString('text.recoveryLink')}
                    disabled={Boolean(userData?.deleteTime)}
                    onClick={handleRecoveryLinkButton}
                    data-testid="recovery-link-button"
                  />
                </div>
              ) : (
                <div />
              )}
              <div className="flex">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-4 py-3 mr-1"
                  onClick={onClose}
                  text={getString('text.cancelButton')}
                />
                {!userData?.deleteTime && (
                  <Button
                    type="submit"
                    className="px-4 py-3 ml-1"
                    disabled={
                      !(isValid && dirty) ||
                      isAddingUserLoading ||
                      isUpdateUserLoading
                    }
                    text={
                      isEdit
                        ? getString('text.update')
                        : getString('text.create')
                    }
                  />
                )}
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

export default CreateUser;
