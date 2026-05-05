import { CircularProgress } from '@material-ui/core';
import React from 'react';

import './index.scss';

export default function Spinner() {
  return (
    <div className="app-loader">
      <CircularProgress color="secondary" />
    </div>
  );
}
