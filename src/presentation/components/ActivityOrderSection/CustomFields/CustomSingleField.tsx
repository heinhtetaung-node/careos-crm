import {
  DownloadFileIcon,
  FileSearchIcon,
  TrashIcon,
} from '@alphafounders/icons';
import { Grid, Box, TextField, Fab as MuiButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import React, {
  useState,
  useEffect,
  useContext,
  MouseEventHandler,
} from 'react';

import { DocumentType } from '../Document/config';
import CommonModal from 'presentation/components/modal/CommonModal';
import DeleteDocumentModal from 'presentation/components/modal/DeleteDocumentModal';
import FileBrowseModal from 'presentation/components/modal/FileBrowseModal';
import { getString } from 'presentation/theme/localization';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

import {
  CustomFieldsProps,
  ICustomField,
  showClassDescriptionLength,
} from './helpers';

import CustomUploadFile from '../common/CustomUploadFile';
import { useFieldStyleSheet, ButtonStyleSheet } from '../document.styles';
import {
  FilesDownload,
  UpdateTypes,
  CustomFieldsContext,
  IUploadedDocument,
} from '../DocumentSection';

// higher order style components, styles hook

interface ICustomSingleFieldProps {
  index: number;
  disabledField: boolean;
  document: FilesDownload | undefined;
  documents: CustomFieldsProps['documents'];
  customField: ICustomField;
  addFields: () => void;
  handleRemoveFields: (index: number) => void;
  handleInputChange: (index: number, description: string) => void;
  handleChangeCurrentFile?: (id: string) => void;
}

const Button = ButtonStyleSheet(MuiButton);

function CustomSingleField({
  index,
  disabledField,
  customField,
  document,
  documents,
  addFields,
  handleRemoveFields,
  handleInputChange,
  handleChangeCurrentFile,
}: ICustomSingleFieldProps) {
  const {
    handleDeleteDocument,
    handleUpdateListFiles,
    handleCustomFieldPreview,
    disabledFileDeleted = false,
    disabledFileUpload = false,
    allowPayslipDocument = false,
    allowBookBankDocument = false,
    listFiles,
  } = useContext(CustomFieldsContext);
  const [hasCreatedField, setHasCreatedField] = useState(false);
  const [isShowDropdown, setIsShowDropdown] = useState(false);
  const [isShowDropzone, setIsShowDropzone] = useState(false);
  const [isShowFileBrowse, setIsShowFileBrowse] = useState(false);
  const [toggleModal, setToggleModal] = useState(false);
  const [isDescriptionFieldError, setIsDescriptionFieldError] = useState(false);
  const [isShowDescriptionLength, setIsShowDescriptionLength] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [otherDocuments, setOtherDocuments] = useState<
    (IUploadedDocument | null)[]
  >([] as IUploadedDocument[]);

  const fieldClasses = useFieldStyleSheet();

  useEffect(() => {
    if (document?.label) {
      setDescription(document?.label);
      return;
    }
    setDescription(customField.description);
    // eslint-disable-next-line
  }, [document?.label]);

  useEffect(() => {
    if (customField.description) {
      setIsShowDropdown(true);
      setIsShowDropzone(true);
      setHasCreatedField(true);
    }
  }, [customField.description, customField.file]);

  useEffect(() => {
    setOtherDocuments(
      documents.filter((doc) => doc?.type === DocumentType.DOCUMENT_TYPE_OTHERS)
    );
  }, [documents]);

  const handleAddCustomFieldBtn: MouseEventHandler<HTMLButtonElement> = () => {
    if (!hasCreatedField) {
      setHasCreatedField(true);
      addFields();
    }
    setIsShowDropdown((toggle) => !toggle);
  };

  const showDropzone = (e: any) => {
    if (!description) {
      setIsDescriptionFieldError(true);
      setIsShowDropzone(false);
      return;
    }
    if (description.length > 50) {
      setIsShowDropzone(false);
      return;
    }
    e.target.blur();
    setIsShowDescriptionLength(false);
    handleInputChange(index, description);
    setIsDescriptionFieldError(false);
    setIsShowDropzone(true);
  };

  const handleOpenCloseModal = () => {
    setToggleModal((toggle) => !toggle);
  };

  const handleOpenCloseDialog = () => {
    setIsShowFileBrowse((toggle) => !toggle);
  };

  const onDeleteDocument = () => {
    handleUpdateListFiles(document, UpdateTypes.Remove);
    handleOpenCloseModal();
    if (document?.fileName) handleDeleteDocument(document?.fileName);
    handleRemoveFields(index);
  };

  const handleOtherFileSectionDelete = () => {
    if (document?.fileName && description) {
      setToggleModal(true);
      return;
    }
    if (disabledField) handleRemoveFields(index);
  };

  return (
    <div>
      <div className={fieldClasses.root}>
        <div className={fieldClasses.otherFiled}>
          <div>
            {document ? (
              <Button
                size="small"
                data-testid="preview-custom-field-btn"
                onClick={() => {
                  if (!handleCustomFieldPreview) {
                    setIsShowFileBrowse(true);
                    return;
                  }
                  if (handleChangeCurrentFile) {
                    handleChangeCurrentFile(document.file);
                  }
                  handleCustomFieldPreview(document);
                }}
              >
                <FileSearchIcon color="primary" fontSize="small" />
              </Button>
            ) : (
              <Button
                size="small"
                onClick={(e) => {
                  handleAddCustomFieldBtn(e);
                  if (handleCustomFieldPreview) {
                    handleCustomFieldPreview({ fileName: 'other' });
                  }
                }}
                disabled={disabledField}
                data-testid="add-custom-field-btn"
              >
                <AddCircleOutlineIcon color="primary" fontSize="small" />
              </Button>
            )}

            {getString('text.other')}
          </div>
          <div className={fieldClasses.actionButtons}>
            <Button
              size="small"
              onClick={() => downloadFileFromBlobURL(document?.file)}
              type="button"
              disabled={!document?.file}
            >
              <DownloadFileIcon fontSize="small" />
            </Button>
            {!disabledFileDeleted && (
              <Button
                size="small"
                type="button"
                data-testid="delete-custom-field-btn"
                onClick={() => handleOtherFileSectionDelete()}
                disabled={
                  disabledField || (!index && !document?.file && !description)
                }
              >
                <TrashIcon color="primary" fontSize="small" />
              </Button>
            )}
          </div>
        </div>
        {isShowDropdown && (
          <>
            <Box
              mt={2}
              display="block"
              width="100%"
              sx={{
                borderTop: '1px solid #e9edf5',
                borderBottom: isShowDropzone && '1px solid #e9edf5',
              }}
            >
              <Grid container alignItems="center">
                <Grid item xs={10}>
                  <Box ml={9} pt={2} pb={isShowDropzone ? 2 : 0}>
                    <TextField
                      InputProps={{ readOnly: disabledFileUpload }}
                      // eslint-disable-next-line react/jsx-no-duplicate-props
                      inputProps={{ 'data-testid': 'text-field' }}
                      fullWidth
                      onChange={(event) => {
                        setIsShowDescriptionLength(true);
                        setDescription(event.target.value);
                      }}
                      onBlur={showDropzone}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') showDropzone(event);
                      }}
                      error={isDescriptionFieldError}
                      helperText={
                        isDescriptionFieldError
                          ? getString('leadDetailFields.other.descriptionempty')
                          : ''
                      }
                      value={description}
                      placeholder={getString(
                        'leadDetailFields.other.placeholder'
                      )}
                    />
                    {isShowDescriptionLength && (
                      <span
                        data-testid="counter-description-length"
                        className={showClassDescriptionLength(
                          description.length,
                          fieldClasses
                        )}
                      >
                        {`${description.length}/50`}
                      </span>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            {isShowDropzone && (
              <Box ml={9} pb="4px" pt="14px">
                <CustomUploadFile
                  title=""
                  value={DocumentType.DOCUMENT_TYPE_OTHERS}
                  document={document}
                  listFiles={listFiles}
                  handleUpdateListFiles={handleUpdateListFiles}
                  handleDeleteDocument={handleDeleteDocument}
                  label={description}
                  documents={otherDocuments}
                  isOtherFile
                >
                  <CustomUploadFile.Content>
                    <CustomUploadFile.Title>
                      {({ showTitle }: any) => showTitle()}
                    </CustomUploadFile.Title>
                    {!document && <CustomUploadFile.Dropzone />}
                  </CustomUploadFile.Content>
                </CustomUploadFile>
                <CommonModal
                  title=""
                  open={toggleModal}
                  handleCloseModal={handleOpenCloseModal}
                >
                  <DeleteDocumentModal
                    handleOpenCloseModal={handleOpenCloseModal}
                    handleRemoveDocument={onDeleteDocument}
                    documentType={getString('text.other')}
                  />
                </CommonModal>
                <FileBrowseModal
                  isDisabled={disabledField}
                  openDialog={isShowFileBrowse}
                  handleCloseDialog={handleOpenCloseDialog}
                  handleDeleteDocument={handleDeleteDocument}
                  label={description}
                  fileLink=""
                  listFiles={listFiles}
                  documents={documents}
                  handleUpdateListFiles={handleUpdateListFiles}
                  allowPayslipDocument={allowPayslipDocument}
                  allowBookBankDocument={allowBookBankDocument}
                />
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CustomSingleField;
