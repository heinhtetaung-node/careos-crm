import React from 'react';

interface InfoContainerProps {
  children: React.ReactNode;
}

function InfoContainer({ children }: InfoContainerProps) {
  return (
    <div className="w-fit text-center border border-solid border-muted-light rounded-lg box-border mx-auto">
      {children}
    </div>
  );
}

export default InfoContainer;
