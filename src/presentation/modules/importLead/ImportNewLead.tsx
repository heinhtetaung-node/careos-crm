import { Grid, Typography } from '@material-ui/core';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LeadCloud from 'data/repository/lead/cloud';
import Controls from 'presentation/components/controls/Control';
import Dropzone from 'presentation/components/dropzone';
import CsvValidation from 'presentation/components/validation/CsvValidation';
import { resetFile, importCSV } from 'presentation/redux/actions/importFile';
import { getString } from 'presentation/theme/localization';
import csvColumns, { csvColumnsWithType } from 'shared/constants/csvColumns';
import { ImportStatus, ImportType } from 'shared/constants/importFile';
import { formatE164 } from 'shared/helper/utilities';
import './importNewLead.scss';

interface ImportNewLeadProps {
  propsData: any;
  close: (isClose: boolean) => void;
  resetFile: () => void;
  importCSV: (data: any) => void;
}

const initialFormData = {
  leadSource: null,
};

interface LeadSource {
  id: number;
  key: string;
  value: string;
  name?: string;
}

interface IFormData {
  leadSource: LeadSource | null;
}

function ImportNewLead({
  propsData,
  close,
  resetFile: handleResetFile,
  importCSV: handleImportLead,
}: ImportNewLeadProps) {
  const childRef: any = useRef();
  const [state, setState] = useState({
    title: false,
    isDisabled: true,
    isErrorMessage: true,
    requiredColumns: ['First Name', 'Phone'],
    isCsv: [
      'application/csv',
      'application/x-csv',
      'text/csv',
      'text/comma-separated-values',
      'text/x-comma-separated-values',
      'text/tab-separated-values',
      'application/vnd.ms-excel',
    ],
  });
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.Default);
  const [csvFile, setCsvFile] = useState<File>();

  useEffect(() => {
    return () => {
      handleResetFile();
    };
  }, [handleResetFile]);

  useEffect(() => {
    const { content } = propsData.data;
    if (content?.errorFileMessage === 'Quotes') {
      setState((prevState) => {
        return {
          ...prevState,
          isErrorMessage: true,
          isDisabled: true,
        };
      });
    }
  }, [propsData.data?.content]);

  useMemo(() => {
    if (formData.leadSource && propsData.data?.content.result.length) {
      setState({ ...state, isDisabled: false });
    } else {
      setState({ ...state, isDisabled: true });
    }
  }, [formData.leadSource]);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const closeModal = () => {
    close(false);
    setState((prevState) => {
      return {
        ...prevState,
        title: false,
        isDisabled: true,
      };
    });
    handleResetFile();
  };

  const handleClick = () => {
    // Pass file and sourceID to Lead import API.
    const csvData = {
      importType: ImportType.Lead,
      source: formData?.leadSource?.name,
      file: csvFile,
    };
    handleImportLead(csvData);

    close(false);
    setState((prevState) => {
      return {
        ...prevState,
        title: false,
      };
    });
    handleResetFile();
  };

  const checkError = (errors: string[]) => {
    setStatus(ImportStatus.Default);

    const isEmptyFileMessage = propsData.data?.content?.errorFileMessage;
    if (
      errors.length ||
      isEmptyFileMessage === 'Delimiter' ||
      isEmptyFileMessage === 'Quotes'
    ) {
      setStatus(ImportStatus.Failure);
      setState((prevState) => {
        return {
          ...prevState,
          isDisabled: true,
          title: false,
        };
      });
    } else if (propsData.data?.content) {
      setStatus(ImportStatus.Success);
      setState((prevState) => {
        return {
          ...prevState,
          title: true,
        };
      });
    }
  };

  const { title, isDisabled, isCsv, isErrorMessage, requiredColumns } = state;

  return (
    <Grid item xs={12} md={12} className="lead-import-new-lead">
      <Dropzone
        importStatus={status}
        setCsvFile={setCsvFile}
        transformResult={(lead: any) => {
          const data = { ...lead };
          data.Phone =
            data.Phone && typeof data.Phone === 'number'
              ? formatE164(data.Phone)
              : data.Phone;

          return data;
        }}
      />
      {status === ImportStatus.Success && (
        <div className="lead-import-new-lead__filename-container">
          <Typography
            variant="h6"
            className="lead-import-new-lead__filename-container__title"
          >
            {getString('text.fileName')}
            &nbsp;
          </Typography>
          <Typography
            variant="h6"
            className="lead-import-new-lead__filename-container__value"
          >
            {propsData.data?.content?.fileName}
          </Typography>
        </div>
      )}
      {title && isCsv.includes(propsData.data.content.fileType) ? (
        <div>
          <p className="lead-title">
            {`${getString('text.leadFound', {
              count: propsData.data.content.result.length,
            })} `}
          </p>
          <Controls.Autocomplete
            name="leadSource"
            label={getString('text.leadSource')}
            fixedLabel
            value={formData.leadSource}
            options={[formData.leadSource]}
            onChange={handleChange}
            async
            asyncFn={LeadCloud.getLeadSourcesService}
            labelField="source"
            valueField="name"
            multiple={false}
            pageSize={1000}
          />
        </div>
      ) : (
        ''
      )}
      {status === ImportStatus.Failure && (
        <Typography variant="h6" className="failure-text">
          {getString('errors.errorReasons')}
        </Typography>
      )}
      <CsvValidation
        style={{
          textAlign: 'left',
          padding: 0,
        }}
        isErrorCheck={isErrorMessage}
        template={csvColumns}
        templateWithType={csvColumnsWithType}
        csvName="Leads"
        ref={childRef}
        requiredColumns={requiredColumns}
        checkError={checkError}
        file={propsData.data?.content}
        maximumUpload={10000}
      />
      <Grid container item className="button-group" justifyContent="flex-end">
        <Controls.Button
          className="unittest-cancel-btn"
          type="button"
          variant="text"
          color="secondary"
          text={getString('text.cancelButton')}
          onClick={() => closeModal()}
          style={{ textTransform: 'uppercase' }}
        />
        <Controls.Button
          className="unittest-submit-btn"
          type="submit"
          color="primary"
          onClick={handleClick}
          disabled={isDisabled}
          text={getString('text.confirmImport')}
          style={{ textTransform: 'uppercase', margin: 0 }}
        />
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state: any) => ({
  propsData: state.importFileReducer.setFileReducer,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      resetFile,
      importCSV,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ImportNewLead);
