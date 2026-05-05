import React, { useMemo } from 'react';

import { HeaderTitle, Paper } from './index.style';
import RenderItem from './RenderItem';
import { IField } from './type';

interface IInfoPanel {
  dataSchema: IField[];
  title: string;
  handleUpdateOrder?: (payload: any) => void;
  error?: {
    field: string;
    msg: string;
  };
}

function InfoPanel({
  dataSchema,
  title,
  handleUpdateOrder = () => null,
  error,
}: IInfoPanel) {
  const headerSection = useMemo(
    () => (
      <HeaderTitle>
        <div className="header-content">
          <b className="unittest-header">{title}</b>
        </div>
      </HeaderTitle>
    ),
    [title]
  );

  const renderGeneralSection = (
    <>
      {headerSection}
      <RenderItem
        props={dataSchema}
        handleUpdateOrder={handleUpdateOrder}
        error={error}
      />
    </>
  );

  return <Paper>{renderGeneralSection}</Paper>;
}

export default InfoPanel;
