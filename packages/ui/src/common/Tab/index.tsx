import React, { Dispatch, PropsWithChildren, useState } from 'react';
import TabContainedHeader from './TabHeaders/Contained';
import TabUnderlineHeader from './TabHeaders/Underline';

enum TabVariant {
  CONTAINED = 'contained',
  UNDERLINE = 'underline',
}

export interface TabHeaderProp {
  tabs: TabProps['tabs'];
  activeTab: TabData | undefined;
  setActiveTab: Dispatch<React.SetStateAction<TabData | undefined>>;
  tabToActive?: number | string;
  onTabChange?: (tab: TabData) => void;
}

export interface TabData {
  id: number | string;
  title: string;
  badge?: number;
  icon?: JSX.Element;
}

export interface TabProps {
  tabs: TabData[];
  tabToActive?: TabData['id'];
  variant?: 'contained' | 'underline';
  onTabChange?: (tab: TabData) => void;
}

function Tab({
  tabs,
  variant = 'contained',
  tabToActive,
  onTabChange = () => undefined,
  children,
}: PropsWithChildren<TabProps>) {
  const getActiveTab =
    tabToActive && tabs?.length > 0
      ? tabs?.find((tab) => tab.id === tabToActive)
      : tabs?.[0];
  const [activeTab, setActiveTab] = useState<TabData | undefined>(getActiveTab);
  const tabHeaderProps = {
    tabs,
    activeTab,
    setActiveTab,
    onTabChange,
  };

  return (
    <>
      {variant === TabVariant.CONTAINED && (
        <TabContainedHeader {...tabHeaderProps} />
      )}
      {variant === TabVariant.UNDERLINE && (
        <TabUnderlineHeader {...tabHeaderProps} />
      )}
      <div data-testid="tab-content" className="overflow-scroll">
        {children}
      </div>
    </>
  );
}

export default Tab;
