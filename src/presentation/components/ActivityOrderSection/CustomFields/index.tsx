import _isEmpty from 'lodash/isEmpty';
import React, { useState, useEffect, useContext } from 'react';

import CustomSingleField from './CustomSingleField';
import {
  CustomFieldsProps,
  ICustomField,
  filterOtherDocuments,
} from './helpers';

import { IUploadedDocument, CustomFieldsContext } from '../DocumentSection';
const DOCUMENTS_LIMIT = 10;
function CustomFields({
  documents,
  isDisabled = false,
  handleChangeCurrentFile,
}: CustomFieldsProps) {
  const [otherDocuments, setOtherDocuments] = useState<
    (IUploadedDocument | null)[]
  >([] as IUploadedDocument[]);
  const [customFields, setCustomFields] = useState<ICustomField[]>([
    {
      description: '',
      file: false,
    },
  ]);
  const { disabledFileUpload } = useContext(CustomFieldsContext);
  const addFields = () => {
    if (customFields.length < 3) {
      setCustomFields((prevFields) => [
        ...prevFields,
        { file: false, description: '' },
      ]);
    }
  };
  const handleRemoveFields = (index: number) => {
    const values = [...customFields];
    values.splice(index, 1);
    setCustomFields(values);
  };
  const handleInputChange = (index: number, description: string) => {
    setCustomFields((prevFields) =>
      prevFields.map((field, i) =>
        i === index ? { ...field, description } : field
      )
    );
  };
  useEffect(() => {
    const filteredDocuments: IUploadedDocument[] =
      filterOtherDocuments(documents);
    setOtherDocuments(filteredDocuments);
    setCustomFields(
      filteredDocuments.map((item) => ({
        description: item?.label.split('-')[0] || '',
        file: true,
      }))
    );
  }, [documents]);
  useEffect(() => {
    const values = [...customFields];
    if (otherDocuments.length) {
      otherDocuments.forEach((doc, idx) => {
        if (doc?.label) {
          if (idx < values.length) {
            values[idx] = {
              ...values[idx],
              description: doc.label.split('-')[0],
              file: true,
            };
          } else {
            values.push({
              description: doc.label.split('-')[0],
              file: true,
            });
          }
        }
      });
      const allowDocumentsCount = values.length < DOCUMENTS_LIMIT;
      if (
        !disabledFileUpload &&
        allowDocumentsCount &&
        otherDocuments.length &&
        values[values.length - 1].description &&
        values[values.length - 1].file
      ) {
        values.push({ description: '', file: false });
      }
      setCustomFields(values);
    } else {
      setCustomFields([{ description: '', file: false }]);
    }
    // eslint-disable-next-line
  }, [otherDocuments]);
  if (disabledFileUpload && otherDocuments.length < 1) return null;
  return (
    <div data-testid="document-upload__custom-fields">
      {customFields &&
        customFields.map((customField: ICustomField, index: number) => {
          const disabledField =
            (index > 0 &&
              Object.values(customFields[index - 1]).some((val) => !val)) ||
            isDisabled;
          const uploadedDocument = otherDocuments[index] as IUploadedDocument;
          const document = _isEmpty(uploadedDocument)
            ? undefined
            : {
                file: uploadedDocument.document,
                fileName: uploadedDocument.label,
                documentType: uploadedDocument.type,
                label: uploadedDocument.label.split('-')[0] || '',
              };
          return (
            <CustomSingleField
              document={document}
              documents={documents}
              disabledField={disabledField}
              handleRemoveFields={handleRemoveFields}
              handleInputChange={handleInputChange}
              customField={customField}
              index={index}
              addFields={addFields}
              key={uploadedDocument?.document || index}
              handleChangeCurrentFile={handleChangeCurrentFile}
            />
          );
        })}
    </div>
  );
}
export default CustomFields;
