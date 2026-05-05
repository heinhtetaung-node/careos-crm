import React from 'react';
import { TabHeaderProp } from '..';
import clsx from 'clsx';
import TabBadge from '../TabBadge';

export default function TabUnderlineHeader({
  tabs,
  activeTab,
  setActiveTab,
}: TabHeaderProp) {
  return (
    <div data-testid="tab-underline-header">
      <ul className="m-0 p-0 border-x-0 border-t-0 border-b border-solid border-line list-none flex flex-wrap text-sm font-medium text-center text-gray-500">
        {tabs.map((tab) => (
          <li className="mr-1 flex flex-col items-center" key={tab?.id}>
            <button
              type="button"
              className={clsx(
                activeTab?.id === tab?.id ? 'text-primary' : 'text-slate-950',
                'inline-block border-0 bg-white cursor-pointer py-3 px-6 font-bold text-sm'
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab?.icon && (
                <span className="mr-2 relative pr-3 [&_svg]:absolute [&_svg]:h-4">
                  {tab?.icon}
                </span>
              )}
              {tab?.title}
              {tab?.badge && <TabBadge badge={tab?.badge} />}
            </button>
            {activeTab?.id === tab?.id && (
              <div className="bg-primary h-1 w-[51px] rounded-t" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
