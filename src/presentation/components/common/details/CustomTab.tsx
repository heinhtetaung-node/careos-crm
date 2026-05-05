import {
  withStyles,
  Tabs as MuiTabs,
  AppBar,
  Tab as MuiTab,
  Box,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

interface Props {
  tabs: { component: React.ReactNode; label?: string }[];
  className?: string | string[];
  dataTestid?: string;
}

export const TabsStyleSheet = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: '0 0.625rem',
    backgroundColor: `${theme.palette.grey[200]}`,
  },
}));

export const TabStyleSheet = withStyles((theme) => ({
  textColorPrimary: {
    color: `${theme.palette.common.sky}`,
  },
  selected: {
    fontWeight: 700,
  },
}));

const Tabs = TabsStyleSheet(MuiTabs);
const Tab = TabStyleSheet(MuiTab);

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

TabPanel.defaultProps = {
  children: <></>,
  dir: '#000',
};

function a11yProps(index: any) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

function CustomTab({ tabs, className, dataTestid, ...props }: Props) {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div
      className={clsx(className, 'shared-comment-text-box')}
      {...props}
      data-testid={dataTestid}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Tabs
          value={value ?? false}
          textColor="primary"
          indicatorColor="primary"
          onChange={handleChange}
          aria-label="disabled tabs example"
        >
          {tabs.map((e, i) => (
            <Tab
              fullWidth={false}
              label={e.label}
              key={e.label}
              {...a11yProps(i)}
            />
          ))}
        </Tabs>
      </AppBar>
      {tabs.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <TabPanel key={i} value={value} index={i} dir={theme.direction}>
          {e.component}
        </TabPanel>
      ))}
    </div>
  );
}

CustomTab.defaultProps = {
  className: '',
};

export default CustomTab;
