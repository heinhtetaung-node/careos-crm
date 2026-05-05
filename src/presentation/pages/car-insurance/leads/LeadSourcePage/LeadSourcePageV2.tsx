import { BlueEditIcon as EditIcon } from '@alphafounders/icons';
import { Button } from '@alphafounders/ui';
import { Card, CardContent, Grid } from '@material-ui/core';
import React, { useState, useMemo } from 'react';
import Helmet from 'react-helmet';

import { useLazyGenericSearchQuery } from 'data/slices/leadSearchSlice';
import { useGetSourcesV2Query } from 'data/slices/sourceSlices/sourceSlices';
import * as mockOption from 'mock-data/LeadSourceSelect.mock';
import Controls from 'presentation/components/controls/Control';
import DateRangeWithType from 'presentation/components/controls/DateRangeWithType';
import FilterPanel from 'presentation/components/FilterPanel';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import CommonModal from 'presentation/components/modal/CommonModal';
import SourceModalV2 from 'presentation/components/modal/SourceModal/SourceModalV2';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

import {
  columnsV2,
  getFilterPanelQueryString,
  getLocaleOptions,
  getSourceOptions,
  initialPageState,
} from './leadSourceHelper';

import './index.scss';

const initialValues = {
  online: null,
  source: [],
  medium: [],
  campaign: [],
  hidden: null,
  autoAssign: null,
  createBy: null,
  updateBy: null,
  createTime: {
    criteria: '',
    range: {
      startDate: null,
      endDate: null,
    },
  },
};

function editButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-row items-center" data-testid="edit-button">
      <EditIcon
        className="cursor-pointer ml-2"
        onClick={onClick}
        fontSize="large"
      />
    </div>
  );
}

function LeadSourcePage() {
  const [openSourceModal, setOpenSourceModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<Record<any, any>>({});
  const [createOrEditSource, setCreateOrEditSource] = useState<
    'create' | 'edit'
  >('create');

  const { TableComponent, TopComponent, refetch } = useTableList(
    'sources',
    columnsV2(),
    {
      ...initialPageState,
      orderBy: 'sourceWithScore.createTime desc',
      type: 'sources',
      filter: filterQuery,
    },
    useLazyGenericSearchQuery,
    undefined,
    undefined
  );

  const { data: sources, isLoading: sourceLoading } = useGetSourcesV2Query({
    useLeadSearchService: true,
  });

  const handleEditSourceClick = (row: any) => {
    setSelectedSource(row);
    setCreateOrEditSource('edit');
    setOpenSourceModal(true);
  };

  const handleCreateSourceClicked = () => {
    setCreateOrEditSource('create');
    setOpenSourceModal(true);
  };

  const handleSubmit = (values: any) => {
    const query = getFilterPanelQueryString({ filters: values });
    setFilterQuery(query);
  };

  const handleReset = () => {
    setFilterQuery('');
  };

  const fields: IFilterFormField[] = useMemo(
    () => [
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'online',
          label: getString('text.type'),
          options: getLocaleOptions(mockOption.Type, 'title'),
          fixedLabel: true,
          multiple: false,
          filterType: 'summary',
          responsive: {
            xs: 6,
            md: 3,
          },
          disableClearable: true,
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'source',
          label: getString('text.source'),
          options: getSourceOptions(sources ?? [], 'source', false),
          loading: sourceLoading,
          fixedLabel: true,
          filterType: 'summary',
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'medium',
          label: getString('text.utmMedium'),
          options: getSourceOptions(sources ?? [], 'medium', false),
          loading: sourceLoading,
          fixedLabel: true,
          filterType: 'summary',
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'campaign',
          label: getString('text.utmCampaign'),
          options: getSourceOptions(sources ?? [], 'campaign', false),
          loading: sourceLoading,
          fixedLabel: true,
          filterType: 'detail',
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'hidden',
          label: getString('text.hide'),
          options: getLocaleOptions(mockOption.Hide, 'title'),
          fixedLabel: true,
          multiple: false,
          filterType: 'detail',
          responsive: {
            xs: 6,
            md: 3,
          },
          disableClearable: true,
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'createBy',
          label: getString('text.createBy'),
          options: getSourceOptions(sources ?? [], 'createByFullName', false),
          loading: sourceLoading,
          multiple: false,
          fixedLabel: true,
          filterType: 'detail',
          responsive: {
            xs: 6,
            md: 3,
          },
          disableClearable: true,
        },
      },
      {
        InputComponent: React.memo(Controls.Autocomplete),
        inputProps: {
          name: 'updateBy',
          label: getString('text.updateBy'),
          options: getSourceOptions(sources ?? [], 'updateByFullName', false),
          loading: sourceLoading,
          multiple: false,
          fixedLabel: true,
          filterType: 'detail',
          responsive: {
            xs: 6,
            md: 3,
          },
          disableClearable: true,
        },
      },
      {
        InputComponent: React.memo(DateRangeWithType),
        inputProps: {
          name: 'createTime',
          selectName: 'criteria',
          label: getString('text.selectDateType'),
          options: getLocaleOptions(mockOption.SelectDateType, 'title'),
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
    ],
    [sources, sourceLoading]
  );

  return (
    <div className="lead-source-page">
      <Helmet title="Leads - Sources" />

      <Grid container>
        <Grid item xs={12} lg={12}>
          <FilterPanel
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </Grid>
        <Card>
          <CardContent>
            <Grid
              item
              xs={12}
              lg={12}
              className="lead-source-page__control-btn"
            >
              <Button
                text={getString('text.createSource')}
                onClick={() => handleCreateSourceClicked()}
                className="button uppercase ml-11 py-3 px-5"
              />
              <TopComponent />
            </Grid>
            <TableComponent
              ActionCellElements={({ row }) =>
                editButton({ onClick: () => handleEditSourceClick(row) })
              }
            />
          </CardContent>
        </Card>
      </Grid>
      <CommonModal
        title={
          createOrEditSource === 'edit'
            ? `${getString('text.update')} Lead Source`
            : `${getString('text.create')} Lead Source`
        }
        open={openSourceModal}
        handleCloseModal={() => setOpenSourceModal(false)}
      >
        <SourceModalV2
          data={selectedSource}
          isEdit={createOrEditSource === 'edit'}
          close={() => setOpenSourceModal(false)}
          onSuccess={() => refetch()}
        />
      </CommonModal>
    </div>
  );
}

export default LeadSourcePage;
