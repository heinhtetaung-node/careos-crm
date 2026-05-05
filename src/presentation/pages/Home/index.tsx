import { Box } from '@material-ui/core';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// class NestedChildError extends Error {
//   constructor() {
//     super('Not implemented');
//     this.name = 'NestedChildError';
//   }
// }

function Home() {
  const navigate = useNavigate();
  const currentUser = useGetUserSelector();
  useEffect(() => {
    if (currentUser?.product === 'products/health-insurance') {
      navigate('/health/leads');
    }
  }, [currentUser]);
  return (
    <Box textAlign="center">
      <p>Welcome to the Lead Management system!</p>
    </Box>
  );
}

export default Home;
