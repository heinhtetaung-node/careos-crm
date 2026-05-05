import clsx from 'clsx';
import React, { ReactElement } from 'react';

import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import { PreviewFile } from 'presentation/components/modal/FileBrowseModal';

interface WithPreviewFormProps {
  EditForm: ReactElement;
  editFormClass?: string;
  previewClass?: string;
  selectedDocument: IUploadedDocument | undefined;
}

export default function WithPreviewForm(props: Readonly<WithPreviewFormProps>) {
  const { EditForm, editFormClass, previewClass, selectedDocument } = props;

  return (
    <div className="flex flex-row items-start gap-4">
      <div className={clsx('basis-1/3 min-w-[280px]', editFormClass)}>
        {EditForm}
      </div>
      <div className={clsx('basis-2/3 min-w-0', previewClass)}>
        <PreviewFile
          document={selectedDocument?.document ?? ''}
          docType={selectedDocument?.fileType ?? ''}
          imgClassName="rounded-[10px] border border-solid border-inputBorder"
          pdfClassName="h-[500px]"
        />
      </div>
    </div>
  );
}
