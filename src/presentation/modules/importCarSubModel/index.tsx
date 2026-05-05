import { Grid, Typography } from '@material-ui/core';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ImportSuccess from 'images/icons/import-lead-complete.svg';
import Controls from 'presentation/components/controls/Control';
import Dropzone from 'presentation/components/dropzone';
import useStyles from 'presentation/components/modal/ImportModal/index.style';
import CsvValidation from 'presentation/components/validation/CsvValidation';
import { resetFile, importCSV } from 'presentation/redux/actions/importFile';
import { getString } from 'presentation/theme/localization';
import {
  csvCarSubmodelColumns,
  csvCarSubmodelColumnsWithType,
  CAR_SUBMODEL_IMPORT_MAX_ROWS,
} from 'shared/constants/csvCarSubmodelColumns';
import { ImportStatus, ImportType } from 'shared/constants/importFile';

interface ImportCarSubModelProps {
  close: (isClose: boolean) => void;
}

function ImportCarSubModel({ close }: ImportCarSubModelProps) {
  const classes = useStyles();
  const childRef = useRef();
  const [importInProgress, setImportInprogress] = useState(false);
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.Default);
  const [stateData, setStateData] = useState({
    isDisabled: true,
    isErrorMessage: true,
  });
  const [csvFile, setCsvFile] = useState<File>();

  const dispatch = useDispatch();
  const setFileData = useSelector(
    (store) => (store as any).importFileReducer.setFileReducer
  );

  useEffect(() => {
    return () => {
      dispatch(resetFile());
    };
  }, [dispatch]);

  const closeModal = () => {
    close(false);
  };

  const checkError = (errors: string[]) => {
    setStatus(ImportStatus.Default);

    const isEmptyFileMessage = setFileData.data?.content?.errorFileMessage;
    if (
      errors.length ||
      isEmptyFileMessage === 'Delimiter' ||
      isEmptyFileMessage === 'Quotes'
    ) {
      setStatus(ImportStatus.Failure);
      setStateData((prevState) => {
        return {
          ...prevState,
          isDisabled: true,
          title: false,
        };
      });
    } else if (setFileData.data?.content) {
      setStatus(ImportStatus.Success);
      setStateData((prevState) => {
        return {
          ...prevState,
          title: true,
          isDisabled: false,
        };
      });
    }
  };

  const handleClick = () => {
    const csvData = {
      importType: ImportType.CarSubModel,
      file: csvFile,
    };
    dispatch(importCSV(csvData));
    setImportInprogress(true);
  };

  const { isDisabled, isErrorMessage } = stateData;

  return importInProgress ? (
    <Grid item xs={12} md={12} className={classes.inProgressContainer}>
      <img
        alt="upload placeholder"
        className={classes.inProgressImage}
        src={ImportSuccess}
      />
      <Typography variant="h6">
        {getString('text.importSubModelProgress')}
      </Typography>
    </Grid>
  ) : (
    <Grid item xs={12} md={12}>
      <Dropzone importStatus={status} setCsvFile={setCsvFile} />
      {status === ImportStatus.Success && (
        <div className={classes.fileContainer}>
          <Typography variant="h6" className={classes.title}>
            {getString('text.fileName')}
            &nbsp;
          </Typography>
          <Typography variant="h6" className={classes.value}>
            {setFileData.data?.content?.fileName}
          </Typography>
        </div>
      )}
      {status === ImportStatus.Failure && (
        <Typography variant="h6" className={classes.failureText}>
          {getString('errors.errorReasons')}
        </Typography>
      )}
      <ul className={classes.validation}>
        <CsvValidation
          isErrorCheck={isErrorMessage}
          template={csvCarSubmodelColumns}
          templateWithType={csvCarSubmodelColumnsWithType}
          csvName="Sub Model Year"
          ref={childRef}
          requiredColumns={['Sub_model_year_id']}
          checkError={checkError}
          file={setFileData.data.content}
          maximumUpload={CAR_SUBMODEL_IMPORT_MAX_ROWS}
        />
      </ul>
      <div className={classes.center}>
        <Controls.Button
          type="button"
          color="secondary"
          className={classes.cancelBtn}
          text={getString('text.cancelButton')}
          onClick={() => closeModal()}
        />
        <Controls.Button
          type="submit"
          color="primary"
          disabled={isDisabled}
          onClick={handleClick}
          text={getString('text.confirmButton')}
        />
      </div>
    </Grid>
  );
}

export default ImportCarSubModel;
