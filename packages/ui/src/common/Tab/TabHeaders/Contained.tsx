import React from 'react';
import { TabData, TabHeaderProp } from '..';
import clsx from 'clsx';
import TabBadge from '../TabBadge';

export default function TabContainedHeader({
  tabs,
  activeTab,
  setActiveTab,
  onTabChange = () => undefined,
}: TabHeaderProp) {
  const onTabHeaderClick = (tab: TabData) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div data-testid="tab-contained-header">
      <ul className="m-0 p-0 list-none flex flex-wrap text-sm font-medium text-center">
        {tabs.map((tab) => (
          <li className="mr-1" key={tab?.id}>
            <button
              type="button"
              className={clsx(
                activeTab?.id === tab?.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary',
                'inline-block border-x border-y border-solid border-line cursor-pointer py-3 px-6 font-bold text-sm rounded-t-10 active'
              )}
              onClick={() => onTabHeaderClick(tab)}
            >
              {tab?.icon && (
                <span
                  className="mr-2 relative pr-4 [&_svg]:absolute [&_svg]:h-4"
                  data-testid="tab-icon"
                >
                  {tab?.icon}
                </span>
              )}
              <span>{tab?.title}</span>
              {tab?.badge && <TabBadge badge={tab?.badge} />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
