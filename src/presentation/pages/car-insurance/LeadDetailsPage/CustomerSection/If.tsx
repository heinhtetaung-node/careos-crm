import React, { PropsWithChildren } from 'react';

import { renderIf } from './helper';

interface IfProps {
  condition: boolean;
}

function If({ condition, children }: PropsWithChildren<IfProps>) {
  return (
    <div data-testid="test-component">{renderIf(condition, children)}</div>
  );
}

export default If;
