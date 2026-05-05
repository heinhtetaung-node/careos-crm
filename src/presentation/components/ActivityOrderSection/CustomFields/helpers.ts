import { Color } from 'presentation/theme/variants';

import { DocumentType } from '../Document/config';

import { IUploadedDocument } from '../DocumentSection';

export interface CustomFieldsProps {
  documents: (IUploadedDocument | null)[];
  isDisabled?: boolean;
  handleChangeCurrentFile?: (id: string) => void;
}

export interface ICustomField {
  description: string;
  file: boolean;
}

export const ButtonStyles = {
  root: {
    background: Color.BG_LIGHT,
    marginRight: '8px',
    border: 'none',
    minWidth: '40px !important',
    height: '40px',
    borderRadius: '100%',
    cursor: 'pointer',
    '& .MuiIcon-colorPrimary': {
      fill: Color.BLUE_BOLD,
    },
  },
  disabled: {
    '& path': {
      fill: Color.GREY_400,
      fontSize: '2rem',
    },
  },
};

export const filterOtherDocuments = (documents: any) =>
  documents.filter(
    (doc: any) => doc?.type === DocumentType.DOCUMENT_TYPE_OTHERS
  );

export const showClassDescriptionLength = (
  lengthDescription: number,
  fieldClasses: any
) => {
  if (lengthDescription < 50) {
    return fieldClasses.descriptionLength;
  }
  return fieldClasses.descriptionError;
};
