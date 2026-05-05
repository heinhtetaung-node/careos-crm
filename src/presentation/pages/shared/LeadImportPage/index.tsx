import { DownloadFileIcon } from '@alphafounders/icons';
import { Card, CardContent, Grid, makeStyles } from '@material-ui/core';
import { useFlags } from 'flagsmith/react';
import React, { useEffect, useMemo, useState } from 'react';
import Helmet from 'react-helmet';
import { useDispatch } from 'react-redux';

import FeatureFlags from 'config/flagsmithConfig';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGetImportHistoryQuery } from 'data/slices/importSlices';
import { useGetSourcesLeadServiceQuery } from 'data/slices/sourceSlices/sourceSlices';
import Controls from 'presentation/components/controls/Control';
import CommonModal from 'presentation/components/modal/CommonModal';
import ImportModal from 'presentation/components/modal/ImportModal';
import useTableList, { HookParams } from 'presentation/hooks/useTableList';
import AddLead from 'presentation/modules/addLead';
import { getLeadSourceOptions } from 'presentation/modules/addLead/addLead.helper';
import AddLeadSuccess from 'presentation/modules/addLeadSuccess';
import { destroyPage } from 'presentation/redux/actions/page';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';
import { formatE164 } from 'shared/helper/utilities';

interface Column {
  id:
    | 'sequenceNumber'
    | 'createBy'
    | 'createTime'
    | 'product'
    | 'imported'
    | 'source'
    | 'status'
    | 'download';
  label: string;
  field?: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
  sorting?: 'none' | 'asc' | 'desc';
  disabled?: boolean;
  customField?: boolean;
  icon?: JSX.Element;
  clickable?: boolean;
}

type ValidationColumn = {
  dataType: string;
  name: string;
};

type SourceFilter = {
  filter: string;
  pageSize: number;
};

type LeadImportPageProps = {
  canCreateLead: (userRole: string) => boolean;
  historyFilter: string;
  sourceFilter: SourceFilter;
  tableName: HookParams['tableType'];
  validationProps: {
    maximumUpload: number;
    optionalColumns?: string[];
    requiredColumns: string[];
    shouldNotHaveColumns?: string[];
    template: string[];
    templateWithType: ValidationColumn[];
  };
};

const useStyles = makeStyles(() => ({
  mainGrid: {
    marginLeft: '40px',
    maxWidth: 'calc(100% - 40px)',
  },
  displayFlex: {
    display: 'flex',
  },
}));

const baseColumns: Column[] = [
  {
    id: 'sequenceNumber',
    label: getString('text.sequence'),
    field: 'sequenceNumber',
    minWidth: 100,
    sorting: 'asc',
  },
  {
    id: 'createBy',
    label: getString('text.importedBy'),
    field: 'createBy',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'createTime',
    label: getString('text.importedOn'),
    field: 'createTime',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'product',
    label: getString('text.product'),
    field: 'product',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'imported',
    label: getString('text.leadRecord'),
    field: 'imported',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'status',
    label: getString('text.status'),
    field: 'status',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'download',
    label: '',
    minWidth: 100,
    sorting: 'none',
    customField: true,
    disabled: true,
    icon: (
      <span className="bg-primary rounded-[50%] p-2">
        <DownloadFileIcon fontSize="large" fillColor="white" />{' '}
      </span>
    ),
    clickable: true,
  },
];

const getLeadImportColumns = (isHideProductColumn: boolean) =>
  baseColumns.filter(
    (column) => !(column.id === 'product' && isHideProductColumn)
  );

const transformLeadImportResult = (result: any) => {
  const data = { ...result };
  data.Phone =
    data.Phone && typeof data.Phone === 'number'
      ? formatE164(data.Phone)
      : data.Phone;

  return data;
};

function LeadImportPage({
  canCreateLead,
  historyFilter,
  sourceFilter,
  tableName,
  validationProps,
}: LeadImportPageProps) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const flags = useFlags([
    FeatureFlags.BROK_316_HIDE_PRODUCT_COLUMN_ON_LEAD_IMPORT_PAGE_20241119_TEMP,
  ]);
  const { data: user } = useGetAuthenticateQuery();
  const { data: sources, isLoading: isSourceLoading } =
    useGetSourcesLeadServiceQuery(sourceFilter);

  const isHideProductColumn =
    flags[
      FeatureFlags
        .BROK_316_HIDE_PRODUCT_COLUMN_ON_LEAD_IMPORT_PAGE_20241119_TEMP
    ].enabled ?? false;

  const columns = useMemo(
    () => getLeadImportColumns(isHideProductColumn),
    [isHideProductColumn]
  );
  const sourceOption = useMemo(
    () => (sources && !isSourceLoading ? getLeadSourceOptions(sources) : []),
    [sources, isSourceLoading]
  );
  const csvColumns = useMemo(
    () => [[...validationProps.template]],
    [validationProps.template]
  );

  const { TableComponent, TopComponent } = useTableList(
    tableName,
    columns,
    {
      ...initialPageState,
      filter: historyFilter,
    },
    useLazyGetImportHistoryQuery
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setisImportOpen] = useState(false);
  const [isAddLeadSuccess, setIsAddLeadSuccess] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(
    () => () => {
      dispatch(destroyPage());
    },
    [dispatch]
  );

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.setAttribute('download', 'template.csv');
    link.setAttribute('href', `data:text/plain;charset=utf-8,${csvColumns}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <Helmet title="Leads - Import" />
      <Grid
        container
        spacing={6}
        className="lead-import"
        data-testid="import-lead-page"
      >
        <Card>
          <CardContent>
            <Grid
              direction="row"
              container
              item
              xs={12}
              lg={12}
              className={classes.mainGrid}
            >
              <Grid
                item
                className={`control-btn-group ${classes.displayFlex}`}
                lg={8}
              >
                {canCreateLead(user?.role ?? '') && (
                  <>
                    <Controls.Button
                      text={getString('text.addLead')}
                      color="primary"
                      onClick={() => setIsOpen(true)}
                    />
                    <CommonModal
                      title={getString('text.addLead')}
                      open={isOpen}
                      handleCloseModal={() => setIsOpen(false)}
                    >
                      <AddLead
                        close={setIsOpen}
                        callBackAddLead={(id: string) => {
                          setIsAddLeadSuccess(true);
                          setLeadId(id);
                        }}
                        sourceOptions={sourceOption}
                        sourceOptionsLoading={isSourceLoading}
                      />
                    </CommonModal>
                    <Controls.Button
                      text={getString('text.importLead')}
                      color="primary"
                      onClick={() => setisImportOpen(true)}
                    />
                  </>
                )}
                <Controls.Button
                  text={getString('text.template')}
                  color="primary"
                  onClick={downloadTemplate}
                />
              </Grid>
              <Grid item lg={4}>
                <TopComponent />
              </Grid>
              <CommonModal
                title=""
                isNotHeader
                open={isAddLeadSuccess}
                handleCloseModal={() => setIsAddLeadSuccess(false)}
              >
                <AddLeadSuccess leadId={leadId} />
              </CommonModal>
              <ImportModal
                title={getString('text.importLead')}
                name="lead import"
                showModal={isImportOpen}
                onClose={() => setisImportOpen(false)}
                validationProps={validationProps}
                progressMessage={getString('text.importLeadProgress')}
                importModalType={ImportType.Lead}
                transformResultFn={transformLeadImportResult}
                showCount
                CustomImportSuccessElements={
                  <Controls.Autocomplete
                    name="leadSource"
                    label={getString('text.leadSource')}
                    fixedLabel
                    value={selectedSource}
                    options={sourceOption ?? []}
                    onChange={(value: any) => {
                      setSelectedSource(value?.target?.value?.name ?? null);
                    }}
                    labelField="source"
                    valueField="name"
                    multiple={false}
                  />
                }
                payloadData={{
                  leadDetails: {
                    source: selectedSource,
                  },
                }}
                btnDisabled={selectedSource === null}
              />
            </Grid>
            <TableComponent />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}

export default LeadImportPage;
