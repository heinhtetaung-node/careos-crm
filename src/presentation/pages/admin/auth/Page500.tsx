import { Button } from '@alphafounders/ui';
import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import Helmet from 'react-helmet';

export function GlobalError({ resetErrorBoundary }: Readonly<FallbackProps>) {
  const errorCode = '500';
  const errorTitle = 'Internal server error';
  const errorDescription =
    'The server encountered something unexpected that did not allow it to complete the request.';
  const errorAction = 'Try again';

  return (
    <div className="p-6 flex flex-col items-center bg-transparent md:p-10">
      <Helmet title="500 Error" />
      <h1 className="text-6xl font-bold mb-6">{errorCode}</h1>
      <h2 className="text-3xl font-bold mb-6">{errorTitle}</h2>
      <p className="text-lg mb-6">{errorDescription}</p>

      <Button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-white rounded-md"
        text={errorAction}
      />
    </div>
  );
}

function Page500() {
  return <ErrorBoundary FallbackComponent={GlobalError} />;
}

export default Page500;
