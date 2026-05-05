import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  AppBar as MuiAppBar,
  makeStyles,
  withStyles,
  createStyles,
  ButtonBase,
  Badge,
  Theme,
} from '@material-ui/core';
import { CreateCSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import * as React from 'react';

import TabItem from './TabItem';
import TabPanel from './TabPanel';

import { IChipProps } from '../Chip';

interface ITabsProp {
  type?: 'default' | 'folder';
  height?: 48 | 60;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable';
  position?: 'absolute' | 'fixed' | 'relative' | 'static' | 'sticky';
  isDivider?: boolean;
  isBoxShadow?: boolean;
  isFolderBorder?: boolean;
  chipTagProps?: IChipProps;
  tabsData: Array<Record<string, any>>;
}

const TabsStyle = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.primary.main,
    minHeight: 'unset',
  },
  vertical: {
    minWidth: '281px',
    borderBottom: '0 !important',
    borderRight: `1px solid ${theme.palette.grey[200]}`,
    '& .MuiTab-root': {
      minHeight: '40px',
      padding: '7px 0',
    },
    '& .tabs-wrapper': {
      minWidth: '281px',
    },
    '& .MuiTab-wrapper': {
      justifyContent: 'start',
    },
    '& .tab-label': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '197px',
    },
    '& .MuiTab-labelIcon .hasTags .tab-label': {
      maxWidth: '172px',
    },
    '&.divider .MuiTab-wrapper': {
      borderRight: 0,
    },
    '& [aria-selected="false"]': {
      fontWeight: 400,
      '&:not(.Mui-disabled)': {
        color: `${theme.palette.grey[800]} !important`,
      },
    },
    '& .MuiTabs-indicator': {
      width: '3px',
    },
  },
  indicator: {
    backgroundColor: theme.palette.primary.main,
  },
}))(MuiTabs);

const TabStyle = withStyles((theme: Theme) => ({
  root: {
    minWidth: 'unset',
    maxWidth: 'unset',
    padding: '12px 0',
    '& .MuiTab-wrapper': {
      flexDirection: 'row',
      padding: '0 20px',
      '& .MuiChip-root': {
        marginLeft: '8px',
      },
    },
    '& .MuiBadge-badge': {
      transform: 'scale(1) translate(100%, -50%)',
      right: '20px',
    },
  },
  textColorInherit: {
    color: theme.palette.primary.main,
    opacity: 1,
  },
  disabled: {
    color: theme.palette.grey[400],
    backgroundColor: theme.palette.common.white,
    opacity: '1 !important',
    '& .MuiChip-root': {
      color: theme.palette.grey[400],
      backgroundColor: theme.palette.grey[100],
    },
  },
  labelIcon: {
    minHeight: 'unset',
    '& svg': {
      marginBottom: '0 !important',
      maxWidth: '15px',
      paddingRight: '11.33px',
    },
  },
}))(MuiTab) as typeof MuiTab;

const AppBarStyle = withStyles(() => ({
  root: {
    boxShadow: 'none',
    width: 'auto',
    right: 'unset',
  },
}))(MuiAppBar);

const mainStyle = makeStyles(() => ({
  root: {
    '&.vertical': {
      display: 'flex',
      '& .MuiChip-root': {
        position: 'absolute',
        right: '10px',
      },
      '& .MuiBadge-badge': {
        transform: 'scale(1) translate(100%, 12%)',
        right: '40px',
      },
      '&.position-fixed, &.position-absolute': {
        '& .tabs-content': {
          paddingLeft: '282px',
        },
      },
    },
    '&.horizontal': {
      '& .tabs-wrapper': {
        height: '50.5px',
      },
    },
    '& .MuiAppBar-root': {
      display: 'flex',
      flexDirection: 'row',
      width: 'auto',
    },
  },
}));

const verticalMinimalStyle = (theme: Theme): CreateCSSProperties => ({
  '& .MuiTab-root': {
    '&:hover': {
      color: `${theme.palette.primary.main} !important`,
    },
  },
  '& .MuiBadge-root': {
    width: '100%',
  },
});

const verticalFolderStyle = (theme: Theme): CreateCSSProperties => ({
  '& .MuiTabs-root': {
    backgroundColor: theme.palette.common.white,
    border: 0,
  },
  '& .MuiTab-root': {
    borderRadius: 0,
    '&:hover:not([aria-selected="true"])': {
      color: `${theme.palette.primary.main} !important`,
    },
  },
  '& .MuiBadge-root': {
    width: '100%',
    margin: 0,
  },
  '& [aria-selected="true"]:not(.Mui-disabled)': {
    borderRadius: '0px 30px 30px 0px',
  },
  '&.folderBorder': {
    '& [aria-selected="false"]': {
      border: 0,
    },
  },
});

const useStyles = makeStyles((theme) =>
  createStyles({
    default: {
      boxShadow: 'none',
      '& .MuiTabs-root': {
        backgroundColor: theme.palette.common.white,
        borderBottom: `2px solid ${theme.palette.grey[200]}`,
      },
      '&.height60': {
        '& .MuiTab-root': {
          minHeight: '60px',
        },
        '& .tabs-wrapper': {
          height: '62px',
        },
      },
      '& .MuiBadge-badge': {
        transform: 'scale(1) translate(100%, -50%)',
        fontWeight: 400,
        borderRadius: '20px',
      },
      '&.vertical': verticalMinimalStyle(theme),
      '&.boxShadow .MuiTabs-root': {
        filter: `drop-shadow(${theme.effects.shadow2})`,
      },
      '&.divider': {
        '& .MuiTab-wrapper': {
          borderRight: `1px dashed ${theme.palette.grey[200]}`,
        },
        '& .MuiTab-root:last-child': {
          '& .MuiTab-wrapper': {
            borderRight: 0,
          },
        },
      },
    },
    folder: {
      boxShadow: 'none',
      '& .MuiTabs-indicator': {
        display: 'none',
      },
      '& .MuiAppBar-root': {
        backgroundColor: 'transparent',
      },
      '& .MuiTabs-root': {
        backgroundColor: 'transparent',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      },
      '& .MuiTab-root': {
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        '&:not(:first-child)': {
          marginLeft: '1px',
        },
      },
      '& .MuiBadge-root': {
        marginRight: '4px',
        marginTop: '4px',
      },
      '&.height60': {
        '& .MuiTab-root': {
          minHeight: '60px',
        },
        '& .tabs-wrapper': {
          height: '62px',
        },
      },
      '& .MuiBadge-badge': {
        transform: 'scale(1) translate(100%, -50%)',
        fontWeight: 400,
        borderRadius: '20px',
      },
      '& [aria-selected="true"]:not(.Mui-disabled)': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '& .MuiChip-root': {
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.common.white,
        },
      },
      '& [aria-selected="false"]:not(.Mui-disabled)': {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.primary.main,
      },
      '&.vertical': verticalFolderStyle(theme),
      '&.boxShadow .MuiTabs-root': {
        filter: `drop-shadow(${theme.effects.shadow2})`,
      },
      '&.folderBorder': {
        '& [aria-selected="false"]': {
          border: `1px solid ${theme.palette.grey[200]}`,
        },
        '& [aria-selected="true"]:not(.Mui-disabled)': {
          border: `1px solid ${theme.palette.primary.main}`,
        },
      },
    },
  })
);

function Tabs({
  type = 'default',
  height = 48,
  orientation = 'horizontal',
  variant = 'standard',
  position = 'static',
  isDivider = false,
  isFolderBorder = false,
  isBoxShadow = false,
  chipTagProps,
  tabsData,
}: ITabsProp) {
  const [selectedTab, setSelectedTab] = React.useState<number | boolean>(false);
  const handleSelected = (_event: any, value: number) => {
    setSelectedTab(value);
  };

  let defaultSelected = tabsData && tabsData.findIndex((tab) => tab?.selected);
  if (defaultSelected < 0) {
    defaultSelected = tabsData && tabsData.findIndex((tab) => !tab?.disabled);
  }

  React.useEffect(() => {
    setSelectedTab(defaultSelected);
  }, [defaultSelected]);

  const classes = useStyles();
  const mainClasses = mainStyle();
  const colorClass = classes[type];
  return (
    <div
      className={clsx(
        mainClasses.root,
        colorClass,
        orientation,
        `position-${position}`,
        isDivider && 'divider',
        isFolderBorder && 'folderBorder',
        isBoxShadow && 'boxShadow',
        height === 60 && 'height60'
      )}
    >
      <div className="tabs-wrapper">
        <AppBarStyle position={position} data-testid="custom-tabs">
          <TabsStyle
            orientation={orientation}
            variant={variant}
            value={selectedTab}
            onChange={handleSelected}
            aria-label="simple tabs example"
          >
            {tabsData &&
              tabsData.length > 0 &&
              tabsData.map((tab, index) => (
                <TabStyle
                  key={tab.label}
                  value={index}
                  icon={tab?.icon && tab.icon}
                  label={tab?.label && tab.label}
                  disabled={tab?.disabled}
                  // eslint-disable-next-line react/no-unstable-nested-components
                  component={React.forwardRef((_props: any, _ref) => (
                    <ButtonBase {..._props} {..._ref}>
                      {!tab?.errors && (
                        <TabItem tab={tab} chipTagProps={chipTagProps} />
                      )}
                      {tab?.errors && (
                        <Badge
                          overlap="rectangular"
                          badgeContent={tab?.errors}
                          color="error"
                        >
                          <TabItem tab={tab} chipTagProps={chipTagProps} />
                        </Badge>
                      )}
                    </ButtonBase>
                  ))}
                />
              ))}
          </TabsStyle>
        </AppBarStyle>
      </div>
      <div className="tabs-content">
        {tabsData &&
          tabsData.length > 0 &&
          tabsData.map((tab, index) => (
            <TabPanel value={selectedTab} index={index} key={tab.label}>
              {tab.content}
            </TabPanel>
          ))}
      </div>
    </div>
  );
}

export default Tabs;
