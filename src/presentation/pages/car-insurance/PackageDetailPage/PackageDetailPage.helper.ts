import React from 'react';

export interface DetailSectionList {
  hasData: boolean;
  title: string;
  packages: number[];
  items: DetailSectionItem[];
}

export interface DetailSectionItem {
  isEmpty?: boolean;
  label: string;
  values: Record<string, Values>;
}

interface Values {
  text: string;
  textValues?: any;
}

export interface ValuesTranslated {
  component: React.ReactNode;
}

interface DetailSectionItemTranslated {
  isEmpty?: boolean;
  label: string;
  values: Record<number, ValuesTranslated>;
}

export interface DetailSectionListTranslated {
  hasData: boolean;
  key: number | string;
  title: string;
  packages: number[];
  items: DetailSectionItemTranslated[];
}
