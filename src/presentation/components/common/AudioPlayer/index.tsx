import { Grid, makeStyles, Theme } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';
import {
  ExpandMoreRounded,
  HeadsetRounded,
  PauseRounded,
  PlayArrowRounded,
  SettingsVoiceOutlined,
  GraphicEqRounded,
} from '@material-ui/icons';
import clsx from 'clsx';
import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import ReactPlayer from 'react-player';

import { getString } from 'presentation/theme/localization';

import Duration, { getMousePositionInElement } from './helpers';

import CommonButton from '../Button/CommonButton';
import IconButton from '../Button/IconButton';
import Menu from '../Menu';
import { MenuOptionProps } from '../Menu/MenuItem';

interface AudioItemProps {
  url: string;
  duration: string;
  date: string;
}

interface IAudioPlayerProps {
  audios: Array<AudioItemProps>;
  color?: 'default' | 'primary';
}

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    '& > div:first-child': {
      display: 'none',
    },
    '& .MuiGrid-root': {
      flexWrap: 'nowrap',
      '& .MuiButton-label': {
        fontWeight: 400,
      },
      '& .audio-menu': {
        backgroundColor: 'transparent',
        '&.MuiButton-outlined': {
          border: 0,
        },
        '& .MuiButton-startIcon': {
          marginRight: '6px',
        },
        '& .MuiButton-endIcon': {
          marginLeft: '9px',
        },
      },
    },
    '& .audio-controls': {
      display: 'flex',
      width: '100%',
      borderLeft: `1px solid ${theme.palette.grey[200]}`,
      padding: `0 5px`,
      '& .action-button': {
        marginRight: '5px',
        '& .MuiIconButton-root': {
          '&:disabled': {
            backgroundColor: 'unset',
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
          },
        },
      },
    },
    '& time': {
      fontSize: '11px',
      color: `${theme.palette.primary.main} !important`,
    },
    '& .progress-bar': {
      display: 'flex',
      flexGrow: 1,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row-reverse',
      '& .MuiSlider-root': {
        height: '4px',
        padding: 0,
        '& .MuiSlider-rail': {
          height: '35px',
          top: '-15px',
          opacity: 0.2,
          borderRadius: '0px',
        },
        '& .MuiSlider-track': {
          height: '4px',
          borderRadius: '10px',
        },
        '& .MuiSlider-thumb': {
          marginTop: '-4px',
          width: '0',
          marginLeft: 0,
        },
      },
      '& .time-position': {
        position: 'absolute',
        top: '-8px',
        transform: 'translateX(-50%)',
        zIndex: 1,
        '& time': {
          color: `${theme.palette.primary.main} !important`,
          fontSize: '11px',
          fontWeight: 700,
        },
        '&:first-of-type': {
          left: 0,
          bottom: '-20px',
        },
      },
      '& .time-pos': {
        position: 'absolute',
        left: 0,
        flexGrow: 1,
        background: '#fff',
        padding: '7px 10px 8px',
      },
      '& .voice-icon': {
        fontSize: '1rem',
        marginRight: '5px',
      },
    },
  },
  default: {
    backgroundColor: 'white',
    borderRadius: '10px',
    border: `1px solid ${theme.palette.primary.main}`,
  },
  primary: {
    borderRadius: '5px',
    backgroundColor: theme.palette.primary.main,
    '& time': {
      color: theme.palette.common.white,
    },
    '& .progress-bar': {
      display: 'flex',
      flexGrow: 1,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      '& .MuiSlider-root': {
        height: '4px',
        padding: 0,
        '& .MuiSlider-rail': {
          color: theme.palette.common.white,
          opacity: 1,
        },
        '& .MuiSlider-track': {
          backgroundColor: theme.palette.common.white,
        },
        '& .MuiSlider-thumb': {
          color: theme.palette.common.white,
        },
      },
    },
  },
}));

function AudioPlayer({ audios, color = 'default' }: IAudioPlayerProps) {
  const [playedTime, setPlayedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(0);
  const [hoverTimeVisible, setHoverTimeVisible] = useState(false);
  const [audioOptions, setAudioOptions] = useState<MenuOptionProps[]>([]);
  const [currentPlaybackRate, setCurrentPlaybackRate] =
    useState<string>('1.0x');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [currentAudio, setCurrentAudio] = useState<Record<string, any>>({
    url: audios && audios.length > 0 ? audios[0].url : '',
    index: 1,
  });
  const audioRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const playBackRateMenu: MenuOptionProps[] = [
    { text: '1.0x' },
    { text: '1.5x' },
    { text: '2.0x' },
  ];
  const playBackRateValue = [1.0, 1.5, 2.0];

  const hideHoverTime = () => {
    setHoverTimeVisible(false);
    setHoverTime(0);
  };

  const onAudioSelect = (_index: number) => {
    setCurrentAudio({
      url: audios[_index].url,
      index: _index + 1,
    });
  };

  const onPlaybackRateChange = (index: number) => {
    setPlaybackRate(playBackRateValue[index]);
    setCurrentPlaybackRate(playBackRateMenu[index].text);
  };

  const handleMouseEnterBar = (e: MouseEvent) => {
    const bar = barRef.current as HTMLDivElement;
    const barWidth = bar.offsetWidth;
    const pos = getMousePositionInElement(e, bar);
    if (pos < 0) return;
    setHoverTime((duration / barWidth) * pos);
    setHoverTimeVisible(true);
  };

  useEffect(() => {
    const handleMouseUp = (e: Event) => {
      if (barRef.current && !barRef.current.contains(e.target as HTMLElement)) {
        hideHoverTime();
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (audios && audios.length > 0) {
      const audioOptionsFormat: MenuOptionProps[] = [];
      audios.forEach((audio) => {
        audioOptionsFormat.push({
          icon: <HeadsetRounded />,
          text: audio.date,
        });
      });
      setAudioOptions(audioOptionsFormat);
    }
  }, [audios]);

  useEffect(() => {
    if (!hoverTime || !duration) return;
    document
      .getElementsByClassName('time-position')[0]
      ?.setAttribute('style', `left: ${(hoverTime / duration) * 100}%`);
  }, [hoverTime, duration]);

  const classes = useStyle();
  const className = classes[color];
  const noFiles = audios.length === 0;

  return (
    <div className={clsx(classes.root, className)} data-testid="audio-player">
      <ReactPlayer
        src={currentAudio && currentAudio?.url}
        ref={audioRef}
        playbackRate={playbackRate}
        className="!hidden"
        onDurationChange={(e: { currentTarget: { duration: number } }) =>
          setDuration(e.currentTarget.duration)
        }
        onTimeUpdate={(e) => setPlayedTime(e.currentTarget.currentTime)}
      />
      <Grid container alignItems="center">
        <Menu
          handleMenuSelect={onAudioSelect}
          options={audioOptions}
          type="icon"
          menuTestid="audio-files"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {({ handleMenu, anchorRef }) => (
            <div ref={anchorRef}>
              <CommonButton
                className="audio-menu"
                color="default"
                startIcon={<SettingsVoiceOutlined />}
                variant={color === 'primary' ? 'contained' : 'outlined'}
                onClick={handleMenu}
                disabled={noFiles}
              >
                {getString('text.file')}
                :&nbsp;
                {`${noFiles ? 0 : currentAudio.index}/${audios.length}`}
              </CommonButton>
            </div>
          )}
        </Menu>
        <div className="audio-controls">
          <div className="action-button">
            {!audioRef.current || audioRef.current.paused ? (
              <IconButton
                color={color}
                icon={<PlayArrowRounded data-testid="audio-play" />}
                handleClick={() => audioRef.current?.play()}
                isDisabled={noFiles}
              />
            ) : (
              <IconButton
                color={color}
                icon={<PauseRounded data-testid="audio-pause" />}
                handleClick={() => audioRef.current?.pause()}
                isDisabled={noFiles}
              />
            )}
          </div>
          <div
            className="progress-bar"
            ref={barRef}
            onMouseMove={handleMouseEnterBar}
            onMouseLeave={hideHoverTime}
            data-testid="audio-progress"
          >
            <Slider
              value={playedTime / duration}
              step={0.00000001}
              min={0}
              max={1}
              onChange={(_, newValue) => {
                if (audioRef.current) {
                  audioRef.current?.pause();
                  audioRef.current.currentTime =
                    (newValue as number) * duration;
                }
              }}
              onChangeCommitted={() => audioRef.current?.play()}
              aria-labelledby="continuous-slider"
              disabled={noFiles}
            />
            {hoverTimeVisible && audios.length > 0 && (
              <span
                className="time-position mouseover"
                data-testid="time-position-hover"
              >
                <Duration seconds={hoverTime} />
              </span>
            )}
            <div className="flex time-pos">
              <GraphicEqRounded className="voice-icon" />
              <div>
                {playedTime <= 0 ? (
                  <time dateTime="P0S">00:00</time>
                ) : (
                  <Duration
                    seconds={
                      audioRef.current && audioRef.current.currentTime
                        ? audioRef.current.currentTime
                        : 0.0
                    }
                  />
                )}
              </div>
              <div>/</div>
              <div>
                <Duration seconds={duration} />
              </div>
            </div>
          </div>
        </div>
        <Menu
          handleMenuSelect={onPlaybackRateChange}
          options={playBackRateMenu}
          type="default"
          menuTestid="playback-rates"
        >
          {({ handleMenu }) => (
            <div>
              <CommonButton
                className="audio-menu"
                color="default"
                endIcon={<ExpandMoreRounded />}
                variant={color === 'primary' ? 'contained' : 'outlined'}
                onClick={handleMenu}
                disabled={noFiles}
              >
                {currentPlaybackRate}
              </CommonButton>
            </div>
          )}
        </Menu>
      </Grid>
    </div>
  );
}

export default AudioPlayer;
