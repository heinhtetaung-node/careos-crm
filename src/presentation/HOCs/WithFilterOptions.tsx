import React from 'react';

interface IOptions {
  [key: string]: string | number | boolean;
}

export default function WithFilterOptions(
  WrappedComponent: React.ComponentType<any>,
  options: IOptions[]
) {
  return class extends React.Component<any, any> {
    constructor(props: any) {
      super(props);
      this.state = {};
    }

    render() {
      return <WrappedComponent options={options} {...this.props} />;
    }
  };
}
