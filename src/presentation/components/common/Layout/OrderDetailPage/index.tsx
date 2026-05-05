import React from 'react';

import { useDetailPageStyles } from './index.styles';

interface IProps {
  children: React.ReactNode;
}

const LayoutOrderDetailPage: React.FC<IProps> = ({ children }) => {
  const classes = useDetailPageStyles();
  return <div className={classes.orderDetailPage}>{children}</div>;
};

export default LayoutOrderDetailPage;
