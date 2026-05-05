import Box from '@material-ui/core/Box';
import * as React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: string | number;
  value: string | number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ padding: '10px' }}>{children}</Box>}
    </div>
  );
}

export default TabPanel;
