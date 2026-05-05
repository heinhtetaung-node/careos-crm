import { useContext } from 'react';

import { Context } from 'Context';

function useUIContext() {
  const ctx = useContext(Context);
  return ctx;
}

export default useUIContext;
