import { BlueEditIcon as EditIcon } from '@alphafounders/icons';
import { Modal } from '@alphafounders/ui';
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet';

import {
  useLazySearchTeamCreateByQuery,
  useLazySearchTeamsQuery,
  useLazySearchUserQuery,
} from 'data/slices/gffSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGenericSearchQuery } from 'data/slices/leadSearchSlice';
import { Team } from 'data/slices/leadSearchSlice/interface';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import CreateTeam from 'presentation/components/modal/TeamsModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

import {
  newColumns,
  getFilterFields,
  initialValues,
  getFilterPanelQueryString,
} from './teamPageHelper';

function ActionComponent({
  row,
  openEditModal,
}: Readonly<{
  row: any;
  openEditModal: (data: any) => void;
}>) {
  return (
    <div className="flex flex-rows items-center" data-testid="edit-button">
      <EditIcon
        className="cursor-pointer ml-2"
        onClick={() => openEditModal(row)}
        fontSize="large"
      />
    </div>
  );
}

function TeamListingPage() {
  const [search] = useLazySearchUserQuery();
  const [searchTeamCreateBy] = useLazySearchTeamCreateByQuery();
  const [searchTeam] = useLazySearchTeamsQuery();

  const fields = getFilterFields({
    isNewTeams: true,
    supervisorSearch: (query) => search({ role: 'roles/supervisor', query }),
    managerSearch: (query) => search({ role: 'roles/manager', query }),
    createBySearch: (query) => searchTeamCreateBy({ query }),
    teamNameSearch: (query) => searchTeam({ query }),
    enableHalthOptions: true,
  });
  const [modalTitle, setModalTitle] = useState(getString('text.createTeam'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Team | null>(null);
  const [filterURI, setFilterURI] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  const columns = newColumns();
  const { TableComponent, TopComponent } = useTableList(
    'team',
    columns,
    {
      ...initialPageState,
      type: 'teams',
      filter: `team.deleteTime="0001-01-01T00:00:00Z" ${filterURI}`,
      orderBy: 'team.createTime desc',
    },
    useLazyGenericSearchQuery,
    undefined,
    undefined,
    [shouldFetch] // fetch table APi on update of given values
  );

  const handleSubmit = useCallback((payload: any) => {
    const formattedURI = getFilterPanelQueryString({ filters: payload });
    setFilterURI(formattedURI);
  }, []);

  const openEditModal = (row?: any) => {
    if (row) {
      setSelectedValue(row);
      setModalTitle(getString('text.editTeam'));
      setIsModalOpen(true);
    } else {
      setSelectedValue(null);
      setModalTitle(getString('text.createTeam'));
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="admin-team-page" data-testid="admin-new-team-page">
        <Helmet title="Admin - Team Page" />
        <div className="flex flex-row">
          <FilterPanel
            fields={fields}
            initialValues={{ ...initialValues, createBy: null }}
            onSubmit={handleSubmit}
            onReset={handleSubmit}
          />
        </div>
        <div className="flex flex-col mt-2 px-2 bg-white">
          <div className="flex justify-between items-center flex-col lg:flex-row my-3">
            <div className="flex flex-col ml-2">
              <div>
                <Controls.Button
                  text={getString('text.createTeam')}
                  color="primary"
                  onClick={() => openEditModal()}
                  className="uppercase ml-[56px]"
                  data-testid="create-team-button"
                />
              </div>
            </div>
            <TopComponent />
          </div>
          <div className="mt-1">
            <TableComponent
              ActionCellElements={({ row }) =>
                ActionComponent({
                  row,
                  openEditModal,
                })
              }
            />
          </div>
        </div>
      </div>
      {createPortal(
        <Modal
          title={modalTitle}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
        >
          <CreateTeam
            data={selectedValue}
            close={() => {
              setIsModalOpen(false);
            }}
            setShouldFetch={setShouldFetch}
          />
        </Modal>,
        document.body
      )}
    </>
  );
}

export default TeamListingPage;
