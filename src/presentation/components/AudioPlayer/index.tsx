import { Grid } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

import Duration from './Duration';
import Pause from './Pause';
import Play from './Play';

import './index.scss';
import { getMousePositionInElement } from '../common/AudioPlayer/helpers';

interface IProps {
  src: string;
}

function AudioPlayer({ src }: IProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const audioRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <ReactPlayer
        src={src}
        ref={audioRef}
        className="!hidden"
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />
      <Grid container alignItems="center" className="rhap">
        <div className="rhap__controls">
          {!audioRef.current || audioRef.current.paused ? (
            <Play handleClick={() => audioRef.current?.play()} />
          ) : (
            <Pause handleClick={() => audioRef.current?.pause()} />
          )}
        </div>
        <div className="rhap__progress">
          {audioRef.current ? (
            <span className="rhap__time">
              <Duration seconds={currentTime} />
            </span>
          ) : null}

          <Slider
            value={currentTime / duration}
            step={0.00000001}
            min={0}
            max={1}
            onChange={(_, newValue) => {
              if (audioRef.current) {
                audioRef.current?.pause();
                audioRef.current.currentTime = (newValue as number) * duration;
              }
            }}
            onMouseMove={(e) => {
              const bar = e.currentTarget as HTMLDivElement;
              const barWidth = bar.offsetWidth;
              const pos = getMousePositionInElement(e, bar);
              if (pos < 0) return;
              setHoverTime((duration / barWidth) * pos);
            }}
            onMouseLeave={() => setHoverTime(null)}
            onChangeCommitted={() => audioRef.current?.play()}
            aria-labelledby="continuous-slider"
          />

          {!!hoverTime && (
            <span
              className="rhap__time rhap__time--hover"
              style={{
                left: `${hoverTime ? `${(hoverTime / duration) * 100}%` : 0}`,
              }}
            >
              <Duration seconds={hoverTime} />
            </span>
          )}

          <span className="rhap__time">
            <Duration seconds={duration} />
          </span>
        </div>
      </Grid>
    </>
  );
}

export default AudioPlayer;
