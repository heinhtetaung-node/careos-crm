export interface IUploadedDocument {
  document: string;
  label: string;
  name: string;
  type: string;
  createBy: string;
  createTime: string;
  deleteTime: string | null;
  updateTime: string | null;
  fileType?: string;
}

export interface IDocument {
  name?: string;
  document: string;
  label: string;
  type: string;
}

interface DocByTypeProps {
  label?: string;
  type?: string;
  documents: (IUploadedDocument | null)[];
}

export const formatDoc = (doc: IDocument) => ({
  name: doc.name,
  file: doc.document,
  fileName: doc.label,
  documentType: doc.type,
});

export const getDocByType = ({ label, type, documents }: DocByTypeProps) => {
  let currentDoc: any = [];

  currentDoc = documents
    ? documents.filter((doc: any) => doc.type === type)
    : [];

  if (!currentDoc[0]) return '';
  return formatDoc(currentDoc[0]);
};
