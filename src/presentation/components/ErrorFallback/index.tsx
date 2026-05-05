import { Button } from '@alphafounders/ui';
import { Helmet } from 'react-helmet';
import React, { useEffect, useState } from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const appVersion = __APP_VERSION__;
  const [nrSessionID, setNrSessionID] = useState<string | null>(null);

  useEffect(() => {
    const getNrSessionID = () => {
      const nrbaSession = window.localStorage.getItem('NRBA_SESSION');
      if (!nrbaSession) return null;
      try {
        const { value } = JSON.parse(nrbaSession) as { value?: string | null };
        return typeof value === 'string' ? value : null;
      } catch {
        console.error('Failed to parse NRBA_SESSION from localStorage');
        return null;
      }
    };

    const sessionID = getNrSessionID();
    if (sessionID) {
      setNrSessionID(sessionID);
    }
  }, []);

  return (
    <div className="p-6 flex flex-col items-center bg-transparent md:p-10">
      <Helmet title="Something went wrong" />
      <h2 className="text-3xl font-bold mb-6">Something went wrong</h2>
      <p className="text-lg mb-6">
        Please refresh the page or contact support if the issue persists.
      </p>

      <div className="flex gap-3">
        <Button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-white rounded-md"
          text="Try again"
        />
        <Button
          onClick={() => {
            window.location.href = '/';
          }}
          variant="secondary"
          className="px-4 py-2 bg-white text-primary rounded-md"
          text="Go Home"
        />
      </div>

      {(appVersion || nrSessionID) && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-2">Trace Information:</p>
          <div className="text-xs text-gray-500 space-y-1 font-mono">
            {appVersion && <div>Client Version: {appVersion}</div>}
            {nrSessionID && <div>New Relic Session ID: {nrSessionID}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
