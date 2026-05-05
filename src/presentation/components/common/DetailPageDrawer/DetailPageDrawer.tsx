import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect } from 'react';

import { getString } from 'presentation/theme/localization';

import Chip from '../Chip';

const drawerWidth = 240;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      top: '146px',
      border: 'none',
      height: 'calc(100vh - 150px)',
      paddingBottom: '16px',
      paddingRight: '4px',
    },
    tab: {
      justifyContent: 'space-between',
      '&:hover': {
        backgroundColor: 'unset',
      },
    },
    selectedTab: {
      fontWeight: 600,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      borderRadius: '0px 30px 30px 0px',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  })
);

function DetailPageDrawer({
  nav,
  children,
  dataTestId = 'detail-page',
  badges,
  tab,
}: {
  nav: Record<string, Record<string, string>>;
  children: React.ReactNode;
  dataTestId?: string;
  badges?: any;
  tab?: string;
}) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState('');

  useEffect(() => {
    document.getElementById(selected)?.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);

  useEffect(() => {
    if (tab) {
      setSelected(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!selected) {
      setSelected(Object.keys(nav)[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  const getChipColor = (key: string) => {
    if (badges[key]?.length) {
      return selected === key ? 'white' : 'primary';
    }
    return selected === key ? 'primary' : 'white';
  };

  return (
    <div className={classes.root} data-testid={dataTestId}>
      <CssBaseline />
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
        data-testid={`${dataTestId}-drawer`}
      >
        <List>
          {Object.entries(nav).map(([key, val]) => (
            <ListItem
              button
              key={key}
              onClick={() => setSelected(key)}
              className={clsx(
                selected === key && classes.selectedTab,
                classes.tab
              )}
            >
              <span data-testid={`${dataTestId}-item-label`}>
                {getString(val.label)}
              </span>
              {badges && (
                <Chip
                  color={getChipColor(key)}
                  text={badges[key]?.length ? badges[key]?.length : '-'}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>

      <main className="grow pb-16" data-testid={`${dataTestId}-content`}>
        {children}
      </main>
    </div>
  );
}

export default DetailPageDrawer;
