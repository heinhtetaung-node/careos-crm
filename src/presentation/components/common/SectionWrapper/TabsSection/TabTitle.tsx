import Badge from '@material-ui/core/Badge';
import * as React from 'react';

import { TabProps } from './interface';

function TabTitle({ title, hideBadge = true }: TabProps) {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible={hideBadge}
      overlap="rectangular"
    >
      {title}
    </Badge>
  );
}

export default TabTitle;
