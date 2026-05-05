import {
  CssBaseline,
  Hidden as HiddenComponent,
  Paper as MuiPaper,
  withWidth,
} from '@material-ui/core';
import { isWidthUp } from '@material-ui/core/withWidth';
import { spacing } from '@material-ui/system';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';

import { LiveListenProvider } from 'presentation/context/LiveListenContext';
import { getLayoutConfig } from 'presentation/redux/actions/theme/layoutActions';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Sidebar, { routes } from '../../components/Sidebar';
import { setCollapseStatus } from '../../redux/actions/ui/index';
import './index.scss';

const Hidden: any = HiddenComponent; // FIXME

const REPONSIVE_MUI_MD = 960;
const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    background: ${(props: any) => props.theme.body.background};
  }

  .MuiCardHeader-action .MuiIconButton-root {
    padding: 4px;
    width: 28px;
    height: 28px;
  }

  &::-webkit-scrollbar {
    width: 6px;
    background: #f2f3fa;
  }
  &::-webkit-scrollbar-track {
    background: #f2f3fa;
  }
  &::-webkit-scrollbar-thumb {
    background: #a5aac0;
    border-radius: 3px;
  }
`;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 260px);
`;

const Paper = styled(MuiPaper)(spacing);

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.body.background};
  padding: 100px 0 40px 0;
  position: relative;

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }
  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;

const sidebarArgs = {
  routes,
  variant: 'temporary',
  width: 260,
  collapsedWidth: 84,
};

function DashboardLayout({ children, width }: any) {
  const collapseStatus = useSelector(
    (state: any) => state.uiInitReducer.isCollapse
  );
  const [burgerCollapseStatus, setBurgerCollapseStatus] =
    useState<boolean>(false);
  const [, setIsShowButton] = useState<boolean>(false);
  const dispatch = useDispatch();

  const toggleCollapse = () => {
    dispatch(setCollapseStatus(!collapseStatus));
  };

  const burgerToggleCollapse = () => {
    setBurgerCollapseStatus(!burgerCollapseStatus);
  };

  const getWidth = () => window.innerWidth;

  const showCollapsedButton = () => {
    if (getWidth() >= REPONSIVE_MUI_MD) {
      setIsShowButton(true);
    } else setIsShowButton(false);
  };

  useEffect(() => {
    dispatch(getLayoutConfig());
  }, []);

  useEffect(() => {
    showCollapsedButton();
    window.addEventListener('resize', showCollapsedButton);
    return () => window.removeEventListener('resize', showCollapsedButton);
  }, [getWidth]);

  return (
    <LiveListenProvider>
      <Root className="dash-board">
        <CssBaseline />
        <GlobalStyle />

        <Hidden smDown>
          <Sidebar
            collapse={collapseStatus}
            toggleCollapse={toggleCollapse}
            {...sidebarArgs}
          />
        </Hidden>

        {burgerCollapseStatus && (
          <Hidden mdUp>
            <Sidebar {...sidebarArgs} />
          </Hidden>
        )}

        <AppContent className="general-body">
          <Header toggleCollapse={burgerToggleCollapse} />
          <MainContent
            p={isWidthUp('lg', width) ? 10 : 5}
            className="main-paper"
          >
            {children}
          </MainContent>
          <Footer />
        </AppContent>
      </Root>
    </LiveListenProvider>
  );
}

export default withWidth()(DashboardLayout);
