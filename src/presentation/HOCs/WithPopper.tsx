import React from 'react';

function WithPopper(Component: React.ComponentType<any>, popperType: any) {
  function WrappedComponent(props: any) {
    if (popperType === 'none') {
      return <Component {...props} />;
    }
    return <Component {...props} placement="bottom-start" />;
  }
  return WrappedComponent;
}

export default WithPopper;
