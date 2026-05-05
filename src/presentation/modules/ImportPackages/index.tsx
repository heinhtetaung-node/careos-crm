import { Grid, Typography } from '@material-ui/core';
import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { PACKAGE_IMPORT_MAX_ROWS } from 'config/constant';
import LeadImportDefault from 'images/icons/import-lead.svg';
import Controls from 'presentation/components/controls/Control';
import Dropzone from 'presentation/components/dropzone';
import CsvValidation from 'presentation/components/validation/CsvValidation';
import { resetFile, importCSV } from 'presentation/redux/actions/importFile';
import { getString } from 'presentation/theme/localization';
import csvPackageColumns from 'shared/constants/csvPackageColumns';
import { ImportStatus, ImportType } from 'shared/constants/importFile';
import './index.scss';

interface IProps {
  propsData: any;
  close: (isClose: boolean) => void;
  resetFile: () => void;
  importCSV: (data: any) => void;
  isStandardPackage?: boolean;
}

const ImportPackages: React.FC<IProps> = ({
  propsData,
  close,
  resetFile: handleResetFile,
  importCSV: handleImport,
  isStandardPackage,
}) => {
  const childRef = useRef();
  const [successfullyImported, setSuccessfullyImported] = useState(false);
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.Default);
  const [stateData, setStateData] = useState({
    isDisabled: true,
    isErrorMessage: true,
  });

  const [csvFile, setCsvFile] = useState<File>();

  useEffect(() => {
    return () => {
      handleResetFile();
    };
  }, [handleResetFile]);

  const closeModal = () => {
    close(false);
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
      setStateData((prevState) => {
        return {
          ...prevState,
          isDisabled: true,
          title: false,
        };
      });
    } else if (propsData.data?.content) {
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
      importType: ImportType.Package,
      file: csvFile,
      packageType: isStandardPackage ? 'STANDARD' : 'RENEWAL',
    };

    handleImport(csvData);
    setSuccessfullyImported(true);
  };

  const { isDisabled, isErrorMessage } = stateData;

  return (
    <>
      {successfullyImported ? (
        <Grid
          item
          xs={12}
          md={12}
          className="package-import__success-container"
        >
          <img
            alt="upload placeholder"
            className="package-import__image"
            src={LeadImportDefault}
          />
          <Typography variant="h6">
            {getString('text.importPackagesProgress')}
          </Typography>
        </Grid>
      ) : (
        <Grid item xs={12} md={12}>
          <Dropzone importStatus={status} setCsvFile={setCsvFile} />
          {status === ImportStatus.Success && (
            <div className="package-import__filename-container">
              <Typography
                variant="h6"
                className="package-import__filename-container__title"
              >
                {getString('text.fileName')}
                &nbsp;
              </Typography>
              <Typography
                variant="h6"
                className="package-import__filename-container__value"
              >
                {propsData.data?.content?.fileName}
              </Typography>
            </div>
          )}
          {status === ImportStatus.Failure && (
            <Typography variant="h6" className="package-import__failure-text">
              {getString('errors.errorReasons')}
            </Typography>
          )}
          <CsvValidation
            style={{
              textAlign: 'left',
              padding: 0,
            }}
            isErrorCheck={isErrorMessage}
            template={csvPackageColumns}
            csvName="Packages"
            ref={childRef}
            requiredColumns={[]}
            checkError={checkError}
            file={propsData.data.content}
            maximumUpload={PACKAGE_IMPORT_MAX_ROWS}
          />
          <div className="package-import__button-group">
            <Controls.Button
              type="button"
              color="secondary"
              text={getString('text.cancelButton')}
              onClick={() => closeModal()}
            />
            <Controls.Button
              type="submit"
              color="primary"
              disabled={isDisabled}
              onClick={handleClick}
              text={getString('text.confirmImport')}
            />
          </div>
        </Grid>
      )}
    </>
  );
};

const mapStateToProps = (state: any) => ({
  propsData: state.importFileReducer.setFileReducer,
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ resetFile, importCSV }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ImportPackages);
