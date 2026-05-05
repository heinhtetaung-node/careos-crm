import * as React from 'react';

import Chip, { IChipProps } from '../Chip';

interface TabItemProps {
  tab: Record<string, any>;
  chipTagProps?: IChipProps;
}

function TabItem({ tab, chipTagProps }: TabItemProps) {
  return (
    <span className={`MuiTab-wrapper ${tab?.tags ? 'hasTags' : ''}`}>
      {tab?.icon && tab.icon}
      {tab?.label && <span className="tab-label">{tab?.label}</span>}
      {tab?.tags && <Chip color="primary" {...chipTagProps} text={tab.tags} />}
    </span>
  );
}

export default TabItem;
