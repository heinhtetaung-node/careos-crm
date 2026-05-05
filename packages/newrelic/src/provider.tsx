'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import NewRelicSingleton from './agent';

interface NewRelicContextProps {
  nrAgent: NewRelicSingleton;
}

const NewRelicContext = createContext<NewRelicContextProps | null>(null);

export const useNewRelic = () => {
  const context = useContext(NewRelicContext);
  if (!context) {
    throw new Error('useNewRelic must be used within a NewRelicProvider');
  }
  return context;
};

interface NewRelicProviderProps {
  newrelic?: any;
}

export function NewRelicProvider({
  children,
  newrelic,
}: Readonly<PropsWithChildren<NewRelicProviderProps>>) {
  const value = useMemo(() => {
    const nrAgent = NewRelicSingleton.getInstance(newrelic);
    return {
      nrAgent,
    };
  }, []);
  return (
    <NewRelicContext.Provider value={value}>
      {children}
    </NewRelicContext.Provider>
  );
}
