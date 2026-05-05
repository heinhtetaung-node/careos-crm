import { useCallback, useEffect, useState } from 'react';

import {
  docTypes,
  healthDocTypes,
} from 'presentation/components/ActivityOrderSection/Document/config';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

type UseCurrentFile = {
  documents: IUploadedDocument[];
  label: string;
};
export default function useCurrentFile({
  documents = [],
  label,
}: UseCurrentFile) {
  const [currentLabel, setCurrentLabel] = useState(label);
  const [docType, setDocType] = useState('');
  const [currentFile, setCurrentFile] = useState<IUploadedDocument | undefined>(
    {} as IUploadedDocument
  );

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  useEffect(() => {
    const file = documents.find((doc) => doc.label.includes(currentLabel));
    const paths = file?.label?.split('.');
    const type = paths ? paths[paths.length - 1] : '';
    setCurrentFile(file);
    if (type) setDocType(type);
  }, [documents, currentLabel]);

  const getFieldFromPolicyDocTypeByLabel = useCallback(
    (field: any) => {
      let documentField = docTypes().find((doc) => doc.label === currentLabel);

      if (globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
        documentField = healthDocTypes().find(
          (doc) => doc.label === currentLabel
        );
      }
      if (!documentField) return 'Other';
      // @ts-expect-error will add later
      return documentField[field];
    },
    [currentLabel]
  );

  return [
    { currentFile, docType },
    setCurrentLabel,
    getFieldFromPolicyDocTypeByLabel,
  ] as const;
}
