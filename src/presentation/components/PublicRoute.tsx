import React, { memo } from 'react';

function PublicRoute({ component: Component, layout: Layout }: any) {
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

export default memo(PublicRoute);
