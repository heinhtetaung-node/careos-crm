import React, { JSXElementConstructor } from 'react';

// Use this function to better typing of config object
export function constructConfig<
  C extends JSXElementConstructor<any>,
  T extends JSXElementConstructor<CommonRowProps>,
>(
  Component: C,
  props: React.ComponentProps<C> & React.ComponentProps<T>,
  CustomRowComponent?: T
) {
  return {
    InputComponent: React.memo(Component),
    inputProps: props,
    CustomRowComponent,
  };
}

type CommonRowProps = {
  title: string;
  showAsterisk?: boolean;
  error?: string;
  isDisabled?: boolean;
  hidden?: boolean;
};

export type IntrisicConstructorConfig = {
  title: React.ReactNode;
  Row?: React.JSXElementConstructor<any>;
};

export type DataSchema = Record<string, ReturnType<typeof constructConfig>>;

export type ConstructorConfig = {
  config?: IntrisicConstructorConfig;
  dataSchema?: DataSchema;
  dataTestId?: string;
};
