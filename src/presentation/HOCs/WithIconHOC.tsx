import React from 'react';

function withIcon(Component: React.ComponentType<any>) {
  function IconSort() {
    return <Component className="MuiTableSortLabel-icon rotate-icon" />;
  }
  return IconSort;
}

export default withIcon;
