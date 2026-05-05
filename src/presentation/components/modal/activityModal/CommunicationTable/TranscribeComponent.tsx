import React, { useEffect, useRef, useState } from 'react';

import { AiChatbotExploration } from 'presentation/components/icons';
import {
  useCallTranscribeMutation,
  useCallTranslationMutation,
} from 'data/slices/leadDetails/communicationSlice/communicationSlice';
import VoiceModal from 'presentation/components/TableAllLead/voiceModal';
import { CustomDialogContent } from '../../CommonModal';
import clsx from 'clsx';

interface TranscribeComponentProps {
  callId: string;
  pollingMilisec?: number;
}

export default function TranscribeComponent({
  callId,
  pollingMilisec = 5000,
}: TranscribeComponentProps) {
  const interval = useRef<ReturnType<typeof setInterval>>();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showError, setShowError] = useState(false);

  const [callTranscribe, { data, isSuccess, isError, error, isLoading }] =
    useCallTranscribeMutation();

  const [
    callTranslate,
    {
      data: translateData,
      isLoading: isTranslateLoading,
      isSuccess: isTranslateSuccess,
      isError: isTranslateError,
    },
  ] = useCallTranslationMutation();

  const checkTranscribeStatus = () => {
    callTranscribe({ callId });
  };

  useEffect(() => {
    if (isSuccess && data?.transcription?.transcription) {
      if (interval.current) clearInterval(interval.current);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isTranslateSuccess) {
      setShowTranslation(true);
    }
  }, [isTranslateSuccess]);

  useEffect(() => {
    if (
      isError &&
      (error as any)?.data?.message?.includes('transcription failed:')
    ) {
      clearInterval(interval.current);
      setShowError(true);
    }

    if (isTranslateError) {
      clearInterval(interval.current);
      setShowError(true);
    }
  }, [isTranslateError, isError]);

  const setTimer = () => {
    interval.current = setInterval(() => {
      checkTranscribeStatus();
    }, pollingMilisec);
  };

  const doTranscribeJob = () => {
    setShowError(false);
    checkTranscribeStatus();
    setTimer();
  };

  useEffect(() => {
    // Fetch data from the server
    if (!interval.current) {
      doTranscribeJob();
    }

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  return (
    <div className="w-full bg-white h-auto flex flex-col justify-center items-center">
      <div className="w-full flex justify-center items-center">
        <div className="w-10/12">
          <CustomDialogContent>
            <div className="select-box">
              <VoiceModal callId={`calls/${callId}`} />
            </div>
          </CustomDialogContent>
        </div>
        {data?.transcription?.transcription && (
          <div className="w-2/12 p-4 transition-all	">
            {showTranslation ? (
              <button
                className={clsx(
                  'w-full p-4 text-white rounded-lg',
                  isTranslateLoading || isLoading
                    ? 'bg-gray-300'
                    : 'bg-primary '
                )}
                onClick={() => setShowTranslation(false)}
                type="button"
                disabled={isTranslateLoading || isLoading}
              >
                View Original
              </button>
            ) : (
              <button
                className={clsx(
                  'w-full p-4 text-white rounded-lg',
                  isTranslateLoading || isLoading
                    ? 'bg-gray-300'
                    : 'bg-primary '
                )}
                onClick={() =>
                  callTranslate({ transcriptionId: data?.transcription.name })
                }
                type="button"
                disabled={isTranslateLoading || isLoading}
              >
                Translate
              </button>
            )}
          </div>
        )}
      </div>
      {showError && (
        <div className="transition-all w-full flex flex-col justify-center items-center mb-2">
          <p className="text-lg">
            {(error as any)?.data?.message.split(':')?.[1]}
          </p>
          <button
            className="bg-primary py-5 px-8 text-white rounded-lg text-lg cursor-pointer"
            onClick={() => doTranscribeJob()}
            type="button"
          >
            Try Again
          </button>
        </div>
      )}

      {!showError && data?.transcription && !isTranslateLoading ? (
        <div className="transition-all w-full flex flex-col h-56 pl-2 overflow-scroll">
          {translateData &&
            translateData?.[showTranslation ? 'translation' : 'transcription']
              ?.split('\n')
              ?.map((line: string, index: number) => (
                <span className="p-1.5" key={index}>
                  {line}
                </span>
              ))}
          {!translateData &&
            data?.transcription.transcription
              ?.split('\n')
              ?.map((line: string, index: number) => (
                <span className="p-1.5" key={index}>
                  {line}
                </span>
              ))}
        </div>
      ) : (
        !showError && (
          <div className="w-full transition-all	flex flex-col justify-center items-center mb-2">
            <img
              src={AiChatbotExploration}
              alt="Ai Chatbot"
              className="w-80 h-auto"
            />
            <p className="text-lg">Our CareAi is thinking</p>
          </div>
        )
      )}
    </div>
  );
}
