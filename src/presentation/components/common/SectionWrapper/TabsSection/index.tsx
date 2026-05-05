import MuiAppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import MuiPaper from '@material-ui/core/Paper';
import MuiTab from '@material-ui/core/Tab';
import MuiTabs from '@material-ui/core/Tabs';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

import Chip from 'presentation/components/common/Chip';

import { TabProps } from './interface';
import TabPanel from './TabPanel';
import TabTitle from './TabTitle';

const Paper = withStyles((theme) => ({
  root: {},
  rounded: {
    borderRadius: '10px',
    border: `1px solid ${theme.palette.grey[200]}`,
  },
}))(MuiPaper);

const AppBar = withStyles((theme) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    backgroundColor: theme.palette.grey[200],
  },
}))(MuiAppBar);

const Tabs = withStyles(() => ({
  root: {
    minHeight: 'unset',
  },
  indicator: {
    height: '3px',
  },
  flexContainer: {
    padding: '10px 10px 0 10px',
  },
}))(MuiTabs);

const Tab = withStyles((theme) => ({
  root: {
    overflow: 'visible',
    padding: '0 0 5.5px',
    minWidth: 'fit-content',
    minHeight: 'unset',
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    marginRight: '20px',
    '&:last-of-type': {
      marginRight: 0,
    },
  },
}))(MuiTab);

interface Props {
  tabs: TabProps[];
}

function TabsSection({ tabs }: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number
  ) => {
    setValue(newValue);
  };

  return (
    <Paper>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map((item) => {
            return <Tab key={item.title} label={<TabTitle {...item} />} />;
          })}
        </Tabs>
        {tabs[value].label && (
          <Box sx={{ paddingRight: 10 }}>
            <Chip
              text={tabs[value].label ?? ''}
              color={tabs[value].labelColor ?? 'success'}
            />
          </Box>
        )}
      </AppBar>
      {tabs.map((item, i) => (
        <TabPanel key={`${item.title}-panel`} value={value} index={i}>
          {item.component}
        </TabPanel>
      ))}
    </Paper>
  );
}

export default TabsSection;
