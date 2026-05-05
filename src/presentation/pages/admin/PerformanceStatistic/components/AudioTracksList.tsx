import React from 'react';
import {
  AudioTrack,
  TrackReference,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { getString } from 'presentation/theme/localization';
import CustomAudioVisualizer from './CustomAudioVisualizer';

interface ParticipantAttributes {
  'sip.callID'?: string;
  // other known attributes can be added here
}

interface ExtendedParticipant {
  _attributes?: ParticipantAttributes;
}

interface AudioTracksListProps {
  audioTracks: TrackReferenceOrPlaceholder[];
  agentName: string;
  openLeadName: string;
  agentParticipantId: string;
}

function AudioTracksList({
  audioTracks,
  agentName,
  openLeadName,
  agentParticipantId,
}: AudioTracksListProps) {
  return (
    <>
      {audioTracks
        .filter((track) => !track.participant.isLocal)
        .map((trackRef) => {
          const track = trackRef.publication?.track;
          const hasTrack = !!track;
          const isSubscribed = trackRef.publication?.isSubscribed;

          const participantId = String(
            trackRef.participant.identity ||
              trackRef.participant.sid ||
              getString('performanceStatistic.unknown')
          );
          const key = String(trackRef.participant.sid);

          return (
            <div key={key} className="mb-6 p-4 border border-gray-300 rounded">
              <div className="mb-2 text-sm">
                {getString('performanceStatistic.participant')} :&nbsp;
                {'sip.callID' in
                ((trackRef.participant as unknown as ExtendedParticipant)
                  ?._attributes ?? {})
                  ? openLeadName
                  : agentName}
              </div>
              <div className="mb-2 text-xs text-gray-500">
                {getString('performanceStatistic.hasTrack')}:{' '}
                {hasTrack ? getString('text.yes') : getString('text.no')} |{' '}
                {getString('performanceStatistic.subscribed')}:{' '}
                {isSubscribed ? getString('text.yes') : getString('text.no')}
              </div>
              <AudioTrack
                trackRef={trackRef as TrackReference}
                volume={1}
                muted={false}
              />
              {(hasTrack || isSubscribed) && (
                <div className="mt-4">
                  <div className="mb-2 text-xs text-gray-600">
                    {getString('performanceStatistic.audioVisualizer')}:
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <CustomAudioVisualizer
                      trackRef={trackRef}
                      barCount={30}
                      height={120}
                    />
                  </div>
                </div>
              )}
              {!hasTrack && (
                <div className="mt-2 text-xs text-yellow-600">
                  {getString('performanceStatistic.trackNotAvailable')}
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}

export default AudioTracksList;
