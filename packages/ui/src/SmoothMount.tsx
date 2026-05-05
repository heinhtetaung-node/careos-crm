import React, { PropsWithChildren, useEffect, useState } from 'react';

function SmoothMount({ children }: PropsWithChildren<any>) {
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    setTimeout(() => setMaxHeight(10000), 5);
  }, []);

  return (
    <div
      className="overflow-hidden"
      // eslint-disable-next-line react/forbid-dom-props
      style={{ maxHeight, transition: 'max-height 5s' }}
    >
      {children}
    </div>
  );
}

export default SmoothMount;
