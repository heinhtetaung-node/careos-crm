import { Typography, Grid, CircularProgress } from '@material-ui/core';
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { AnyObject } from 'yup';

import { useImportFileMutation } from 'data/slices/importSlices';
import { Upload } from 'data/slices/importSlices/interface';
import Controls from 'presentation/components/controls/Control';
import DatePickerWithThaiYear from 'presentation/components/controls/DatePickerWithThaiYear';
import Dropzone from 'presentation/components/dropzone';
import { ImportLead } from 'presentation/components/icons';
import CsvValidation from 'presentation/components/validation/CsvValidation';
import { resetFile } from 'presentation/redux/actions/importFile';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';
import { validateDataWithType } from 'shared/helper/csvValidationErrors';
import useSnackbar from 'utils/snackbar';

import { FileCheckStatus, TemplateWithType, TypeFile } from './index.helper';
import useStyle from './index.style';

import CommonModal from '../CommonModal';

interface ImportModalProps {
  title?: string;
  name: string;
  titleCenter?: boolean;
  showModal: boolean;
  onClose: () => void;
  validationProps: {
    template: string[];
    optionalColumns?: string[];
    requiredColumns: string[] | string[][];
    shouldNotHaveColumns?: string[];
    templateWithType?: TemplateWithType[];
    maximumUpload?: number;
  };
  progressMessage?: string;
  importModalType: ImportType;
  payloadData?: AnyObject;
  customImportState?: {
    agent_discount_rule_details?: Upload['agent_discount_rule_details'];
    customerDetails?: Upload['customerDetails'];
  };
  CustomImportElements?: JSX.Element;
  transformResultFn?: (result: any) => any;
  showCount?: boolean;
  CustomImportSuccessElements?: JSX.Element;
  btnDisabled?: boolean;
  parentData?: any;
  refetchImportHistory?: () => void;
}

function ImportModal({
  title = 'Import',
  name,
  titleCenter = true,
  showModal,
  onClose,
  validationProps,
  progressMessage,
  importModalType,
  payloadData,
  customImportState,
  CustomImportElements,
  transformResultFn,
  CustomImportSuccessElements,
  refetchImportHistory,
  showCount = false,
  btnDisabled = false,
  parentData = null,
}: Readonly<ImportModalProps>) {
  const classes = useStyle();
  const dispatch = useAppDispatch();
  const [fileCheckStatus, setFileCheckStatus] = useState<FileCheckStatus>(
    FileCheckStatus.DEFAULT
  );

  useEffect(() => {
    setFileCheckStatus(FileCheckStatus.DEFAULT);
  }, [parentData]);

  const fileData = useAppSelector(
    (store) =>
      (store.importFileReducer?.setFileReducer?.data?.content ?? {}) as TypeFile
  );

  const productType = useAppSelector(
    (store) => store.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const { showErrorSnackbar } = useSnackbar();

  const [
    uploadFile,
    {
      isLoading: uploadLoading,
      isSuccess: uploadSuccess,
      isError: uploadError,
      error: uploadErrorMessage,
    },
  ] = useImportFileMutation();

  const [file, setFile] = useState<File>();
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const isAutoAssignImport =
    importModalType === ImportType.AutoAssignLeadConfig;
  const isDiscountsImport = importModalType === ImportType.Discounts;
  const isCustomerProfile = importModalType === ImportType.CustomerProfile;

  const isEffectiveDate =
    isAutoAssignImport && !dateError && typeof date === 'string';
  const isCustomElement =
    (isDiscountsImport || isCustomerProfile) && !!CustomImportElements;

  const handleCloseCancel = () => {
    setUploadInProgress(false);
    setFileCheckStatus(FileCheckStatus.DEFAULT);
    setFile(undefined);
    dispatch(resetFile());
    onClose();
  };

  useEffect(() => {
    if (!ImportType.Discounts) setUploadInProgress(false);
    dispatch(resetFile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, customImportState?.agent_discount_rule_details]);

  useEffect(() => {
    if (!uploadLoading) {
      if (uploadError) {
        showErrorSnackbar(
          uploadErrorMessage
            ? (uploadErrorMessage as string)
            : getString('text.uploadFailed')
        );
      } else if (uploadSuccess) {
        setUploadInProgress(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadLoading, uploadError, uploadSuccess, uploadErrorMessage]);

  const checkError = (errors: string[]) => {
    if (
      errors.length > 0 ||
      fileData.isEmptyFileMessage === 'Delimiter' ||
      fileData.isEmptyFileMessage === 'Quotes'
    ) {
      setFileCheckStatus(FileCheckStatus.ERROR);
      return;
    }
    if (!isEmpty(fileData)) {
      setFileCheckStatus(FileCheckStatus.SUCCESS);
    }
  };

  const handleClick = () => {
    let uploadPayload = {
      file: file as File,
      importType: importModalType,
      product: [
        'INSURANCE_CONDITION_SETS',
        'INSURANCE_CONDITION_ITEMS',
        'INSURANCE_COVERAGE',
        'INSURANCE_PREMIUM',
        'INSURANCE_PACKAGES',
        'INSURANCE_MOTOR',
      ].includes(payloadData?.packageDetails?.packageType)
        ? 'products/generic'
        : productType,
      ...payloadData,
    } as Upload;

    if (isCustomElement) {
      uploadPayload = {
        ...uploadPayload,
        ...customImportState,
      };
    }
    // should be removed, instead use customImportState
    if (isEffectiveDate) {
      uploadPayload.autoAssignDetails = {
        effectiveDate: date,
      };
    }
    uploadFile(uploadPayload);
    if (refetchImportHistory) setTimeout(() => refetchImportHistory(), 5000);
  };

  return (
    <CommonModal
      titleCenter={titleCenter}
      title={title}
      open={showModal}
      handleCloseModal={handleCloseCancel}
    >
      {uploadInProgress ? (
        <Grid item xs={12} md={12} className={classes.inProgressContainer}>
          <ImportLead />
          <Typography variant="h6">
            {progressMessage ?? getString('text.importPackagesProgress')}
          </Typography>
        </Grid>
      ) : (
        <Grid item xs={12} md={12}>
          {/* should be removed, instead use CustomImportElements  */}
          {isAutoAssignImport && (
            <DatePickerWithThaiYear
              className={clsx('mt-4', dateError && 'Mui-error')}
              value={date}
              error={dateError ?? ''}
              placeholder={getString('text.enterEffectiveDate')}
              name="effectiveDate"
              shouldDisableDate={(_date) =>
                !validateDataWithType('effectiveDate', _date)
              }
              onChangeDate={(value) => {
                setDate(new Date(value).toISOString());
                setDateError(
                  !validateDataWithType('effectiveDate', value)
                    ? getString('errors.invalidEffectiveDate')
                    : null
                );
              }}
            />
          )}
          {/* render additional elements  */}
          {isCustomElement && CustomImportElements}
          <Dropzone
            importStatus={fileCheckStatus}
            importModalType={importModalType}
            setCsvFile={setFile}
            transformResult={transformResultFn}
          />
          {fileCheckStatus === FileCheckStatus.SUCCESS && (
            <>
              <div className="flex items-center flex-wrap pt-5 break-words">
                <span className="text-lg font-bold text-left">
                  {getString('text.fileName')}
                  &nbsp;
                </span>
                <span className="text-lg font-bold text-left text-[#5fb15c] break-all">
                  {fileData.fileName}
                </span>
              </div>
              <div>
                {showCount && (
                  <p className="font-bold py-2">
                    {getString('text.leadFound', {
                      count: fileData?.result?.length,
                    })}
                  </p>
                )}
                {CustomImportSuccessElements}
              </div>
            </>
          )}
          {fileCheckStatus === FileCheckStatus.ERROR && (
            <Typography variant="h6" className={classes.failureText}>
              {getString('errors.errorReasons')}
            </Typography>
          )}
          <CsvValidation
            className={classes.validation}
            csvName={name}
            isErrorCheck
            checkError={checkError}
            file={fileData}
            importModalType={importModalType}
            {...validationProps}
          />
          <div className={classes.center}>
            <Controls.Button
              type="button"
              className={classes.cancelBtn}
              color="secondary"
              text={getString('text.cancelButton')}
              onClick={handleCloseCancel}
            />
            <Controls.Button
              type="submit"
              color="primary"
              disabled={
                fileCheckStatus !== FileCheckStatus.SUCCESS ||
                (isAutoAssignImport && !isEffectiveDate) ||
                btnDisabled
              }
              onClick={!uploadLoading ? handleClick : undefined}
              text={
                uploadLoading ? (
                  <CircularProgress color="inherit" size={28} />
                ) : (
                  getString('text.confirmImport')
                )
              }
            />
          </div>
        </Grid>
      )}
    </CommonModal>
  );
}

export default ImportModal;
