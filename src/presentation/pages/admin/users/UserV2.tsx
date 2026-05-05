/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import { BlueEditIcon as EditIcon } from '@alphafounders/icons';
import { Modal } from '@alphafounders/ui';
import clsx from 'clsx';
import { useFlags } from 'flagsmith/react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import FeatureFlags from 'config/flagsmithConfig';
import {
  useLazySearchUserCreateByQuery,
  useLazySearchUserQuery,
} from 'data/slices/gffSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGenericSearchQuery } from 'data/slices/leadSearchSlice';
import { useLazyGetTeamsQuery } from 'data/slices/teamSlice';
import { useLazyGetUserRolesQuery } from 'data/slices/userSlice';
import { SelectDateType } from 'mock-data/AdminPage.mock';
import { AgentScore, Status } from 'mock-data/AdminUser.mock';
import Controls from 'presentation/components/controls/Control';
import DateRangeWithType from 'presentation/components/controls/DateRangeWithType';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import CommonModal from 'presentation/components/modal/CommonModal';
import CreateUser from 'presentation/components/modal/UserModal';
import useTableList from 'presentation/hooks/useTableList';
import ImportUser from 'presentation/modules/importUser';
import { resetFile } from 'presentation/redux/actions/importFile';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import ProductOptions from 'shared/constants/productOptions';
import { IAdminUserMock } from 'shared/helper/AdminUser.mock';
import * as Yup from 'yup';

import {
  columnV2,
  download,
  getFilterPanelQueryString,
} from './userPageHelper';

import { formatUserList } from '../../../redux/reducers/admin/user/listUser/index';

import './userPage.scss';
import { setImportUserFlag } from 'presentation/redux/actions/admin/user';
import { isEnableSSO } from 'app.helper';

const initialValues = {
  humanId: null,
  fullName: null,
  userFullName: '',
  annotations: [],
  dateTime: {
    criteria: '',
    range: {
      startDate: null,
      endDate: null,
    },
  },
  licenseNo: '',
  teamProduct: [],
  teamDisplayName: [],
  role: [],
  status: [],
  createBy: null,
};

function editButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-rows items-center" data-testid="edit-button">
      <EditIcon
        className="cursor-pointer ml-2"
        onClick={onClick}
        fontSize="large"
      />
    </div>
  );
}

function UserPage() {
  const dispatch = useAppDispatch();
  const featureFlags = useFlags([
    FeatureFlags.LEAD_4764_USE_NEW_MODAL_FOR_CREATE_UPDATE_USER_20240129_TEMP,
  ]);

  const enableLeadImportButton =
    featureFlags[
      FeatureFlags.LEAD_4764_USE_NEW_MODAL_FOR_CREATE_UPDATE_USER_20240129_TEMP
    ]?.enabled;

  const [createOrEditUser, setCreateOrEditUser] = useState<'create' | 'edit'>(
    'create'
  );
  const [openImportUserModal, setOpenImportUserModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IAdminUserMock>();
  const [filterQuery, setFilterQuery] = useState('');
  const [downloadTemplateLoading, setDownloadTemplateLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  const [getTeams] = useLazyGetTeamsQuery();
  const [getUserRoles] = useLazyGetUserRolesQuery();
  const [fetchUsers] = useLazyGenericSearchQuery();
  const [searchUsers] = useLazySearchUserCreateByQuery();
  const [search] = useLazySearchUserQuery();

  const { TableComponent, TopComponent } = useTableList(
    'user',
    columnV2(['licenseNo', 'licenseIssueDate', 'licenseExpiryDate']),
    {
      ...initialPageState,
      orderBy: 'user.createTime desc',
      type: 'users',
      filter: filterQuery,
    },
    useLazyGenericSearchQuery,
    undefined,
    undefined,
    [shouldFetch]
  );

  const isImportUserSuccess = useAppSelector(
    (state) =>
      state.userReducer?.importUserReducer?.importUserSuccess === 'success'
  );

  const fields: IFilterFormField[] = [
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'humanId',
        label: getString('text.user'),
        options: [],
        async: true,
        hasFormattedResponse: true,
        onFocusFn: async () =>
          search({ query: '' }).then(({ data }) => ({
            data: data?.users.map((u) => ({
              id: u.name,
              humanId: u.displayName,
              value: u.name,
            })),
          })),
        searchFn: async (query) =>
          search({ query }).then(({ data }) =>
            data?.users.map((u) => ({
              id: u.name,
              humanId: u.displayName,
              value: u.name,
            }))
          ),
        labelField: 'humanId',
        placeholder: getString('text.inputUser'),
        multiple: false,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
        disableClearable: true,
      },
    },
    {
      InputComponent: Controls.Input,
      inputProps: {
        name: 'userFullName',
        label: getString('text.name'),
        placeholder: getString('text.inputName'),
        multiple: false,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'annotations',
        label: getString('text.agentScore'),
        options: AgentScore,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: DateRangeWithType,
      inputProps: {
        name: 'dateTime',
        selectName: 'criteria',
        label: getString('text.selectDateType'),
        options: [
          ...SelectDateType.map((type) => ({
            ...type,
            title: getString(type.title),
          })),
          {
            id: 4,
            title: getString('dateType.licenseIssueDate'),
            value: 'licenseIssueDate',
          },
          {
            id: 5,
            title: getString('dateType.licenseExpiryDate'),
            value: 'licenseExpiryDate',
          },
        ],
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 6,
        },
      },
      xs: 12,
      md: 12,
      lg: 12,
      xl: 6,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'teamProduct',
        label: getString('text.product'),
        options: ProductOptions.map((prod) => ({
          ...prod,
          title: getString(prod.title),
        })),
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'teamDisplayName',
        testid: 'team-autocomplete-new',
        label: getString('text.team'),
        onFocusFn: () => getTeams({ pageSize: 100 }),
        labelField: 'displayName',
        options: [],
        fixedLabel: true,
        filterType: 'detail',
        valueField: 'name',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'role',
        label: getString('text.userRole'),
        onFocusFn: () => getUserRoles({ pageSize: 100 }),
        apiDataField: 'roles',
        options: [],
        fixedLabel: true,
        filterType: 'detail',
        valueField: 'name',
        labelField: 'displayName',
        missingId: true,
        testid: 'user-role-autocomplete',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'status',
        label: getString('text.status'),
        options: Status.map((status) => ({
          ...status,
          title: getString(status.title),
        })),
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'createBy',
        label: getString('text.createBy'),
        async: true,
        lookup: true,
        searchFn: (query) =>
          searchUsers({ query }).then(({ data }) =>
            data?.users?.map((x) => ({
              id: x.name,
              displayName: x.displayName,
              value: x.name,
            }))
          ),
        onFocusFn: () =>
          searchUsers({ query: '' }).then(({ data }) => ({
            data: data?.users?.map((x) => ({
              id: x.name,
              displayName: x.displayName,
              name: x.name,
            })),
          })),
        labelField: 'displayName',
        multiple: false,
        valueField: 'name',
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        disableClearable: true,
        testid: 'create-by-autocomplete',
      },
    },
    {
      InputComponent: Controls.Input,
      inputProps: {
        name: 'licenseNo',
        label: getString('text.licenseNo'),
        placeholder: getString('text.inputLicenseNo'),
        multiple: false,
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
  ];

  const handleSubmit = (values: any) => {
    let query = getFilterPanelQueryString({ filters: values });
    // custom logic for status filter
    if (values.status.length === 1) {
      if (values.status[0].value === 1) {
        query += 'user.deleteTime="0001-01-01T00:00:00Z"';
      } else if (values.status[0].value === 2) {
        query += 'user.deleteTime > "2000-01-01T00:00:00Z"';
      }
    }
    setFilterQuery(query);
  };

  const handleReset = () => {
    setFilterQuery('');
  };

  const handleAddUserClick = () => {
    setSelectedUser(undefined);
    setCreateOrEditUser('create');
    setOpenUserModal(true);
  };

  const handleEditUserClick = (row: any) => {
    setSelectedUser(row);
    setCreateOrEditUser('edit');
    setOpenUserModal(true);
  };

  const handleDownload = async () => {
    setDownloadTemplateLoading(true);
    const userList = [];
    let response: any;
    let page_from = 0;
    do {
      response = await fetchUsers({
        queryParams: {
          page_from,
          pageSize: 100,
          showDeleted: true,
          filter: '',
          type: 'users',
        } as any,
      });
      page_from += 100;
      userList.push(...response.data.users);
    } while (userList.length < parseInt(response.data.total, 10));
    setDownloadTemplateLoading(false);
    download(formatUserList(userList));
  };

  useEffect(() => {
    if (isImportUserSuccess) {
      setOpenImportUserModal(false);
    }
  }, [isImportUserSuccess]);

  return (
    <div className="user-page">
      <div>
        <FilterPanel
          fields={fields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onReset={handleReset}
          validationSchema={Yup.object().shape({
            licenseNo: Yup.string()
              .max(20)
              .test(
                'check-licenseNo',
                'License No. must include alphanumeric characters only',
                (value: string | undefined) =>
                  value === undefined ? true : /^([A-Za-z0-9])*$/.test(value)
              ),
          })}
        />
      </div>
      <div>
        <div className="py-5 bg-white pb-20">
          <div className="flex justify-between flex-wrap">
            <div className="control-btn-group flex flex-row items-center ml-[20px]">
              {!isEnableSSO && (
                <Controls.Button
                  text={getString('text.addUser')}
                  color="primary"
                  onClick={handleAddUserClick}
                  className={clsx(`uppercase`)}
                />
              )}

              <Controls.Button
                loading={downloadTemplateLoading}
                text={getString('text.templateButton')}
                color="primary"
                disabled={downloadTemplateLoading}
                onClick={handleDownload}
                className="uppercase h-[2.6rem]"
              />
              {!isEnableSSO && enableLeadImportButton && (
                <Controls.Button
                  text={getString('text.importedUser')}
                  color="primary"
                  onClick={() => {
                    setOpenImportUserModal(true);
                    dispatch(setImportUserFlag('idle'));
                  }}
                  className={clsx(`uppercase`)}
                />
              )}
            </div>
            <TopComponent />

            {createPortal(
              <Modal
                title={
                  createOrEditUser === 'edit'
                    ? getString('text.updateUser')
                    : getString('text.addUser')
                }
                isOpen={openUserModal}
                onClose={() => {
                  setOpenUserModal(false);
                }}
              >
                <CreateUser
                  userData={selectedUser}
                  onClose={() => {
                    setOpenUserModal(false);
                  }}
                  isEdit={createOrEditUser === 'edit'}
                  setShouldFetch={setShouldFetch}
                />
              </Modal>,
              document.body
            )}

            <CommonModal
              title={getString('text.importedUser')}
              open={openImportUserModal}
              handleCloseModal={() => {
                dispatch(resetFile());
                setOpenImportUserModal(false);
              }}
            >
              <ImportUser close={() => setOpenImportUserModal(false)} />
            </CommonModal>
          </div>
          <TableComponent
            ActionCellElements={({ row }) =>
              editButton({ onClick: () => handleEditUserClick(row) })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default UserPage;
