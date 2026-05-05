import React from 'react';

import useUIContext from 'Context/useUIContext';

interface DefaultSelectFileBodyProps {
  fileName?: string;
}

function DefaultSelectFileBody({ fileName }: DefaultSelectFileBodyProps) {
  const { t } = useUIContext();
  if (fileName) {
    return <span>{fileName}</span>;
  }
  return (
    <span>
      {/* eslint-disable-next-line prettier/prettier */}
      {t('dragAndDropFile')}
      {' '}
      <span className="text-primary">{t('chooseFile')}</span>
    </span>
  );
}

export default DefaultSelectFileBody;
