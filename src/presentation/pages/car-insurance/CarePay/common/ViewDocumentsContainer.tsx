import { DownloadFileIcon, FileSearchIcon } from '@alphafounders/icons';
import CustomUploadFile from 'presentation/components/ActivityOrderSection/common/CustomUploadFile';
import {
  PreviewFile,
  Button,
} from 'presentation/components/modal/FileBrowseModal';
import { getString } from 'presentation/theme/localization';
import React from 'react';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

interface ViewDocumentsContainerProps {
  ActionButtons: React.ReactNode;
  selectedDocument: string | null;
  setSelectedDocument: (value: string) => void;
  documents: { title: string; value: string }[];
  unknownFileType?: boolean;
}

function ViewDocumentsContainer({
  ActionButtons,
  selectedDocument,
  setSelectedDocument,
  documents,
  unknownFileType,
}: ViewDocumentsContainerProps) {
  return (
    <div className="w-full mt-4 flex h-auto -p-6">
      <PreviewFile
        document={selectedDocument ?? ''}
        docType="jpg"
        className="w-full mt-4"
        unknownFileType={unknownFileType}
      />
      <div className="w-80 text-left flex flex-col p-4">
        {documents.map(({ title, value }) => (
          <div
            key={title}
            className="flex mt-2 w-full items-center justify-between"
          >
            <div className="w-4/12 flex">
              <CustomUploadFile.PreviewButton>
                <Button
                  data-testid="preview-add-btn"
                  onClick={() => setSelectedDocument(value)}
                  size="small"
                >
                  <FileSearchIcon fontSize="small" color="primary" />
                </Button>
                <Button
                  data-testid="download-btn"
                  onClick={() => downloadFileFromBlobURL(value)}
                  size="small"
                >
                  <DownloadFileIcon className="text-primary" />
                </Button>
              </CustomUploadFile.PreviewButton>
            </div>
            <span className="w-8/12">{getString(title)}</span>
          </div>
        ))}

        {ActionButtons}
      </div>
    </div>
  );
}

export default ViewDocumentsContainer;
