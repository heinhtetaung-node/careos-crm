import React from 'react';

interface CounterProps {
  duration: number;
  className?: string;
}

export default function Counter({ duration, className = '' }: CounterProps) {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  if (duration === 0) {
    return null;
  }

  return (
    <div className={className} data-testid="call-duration-counter">
      <time dateTime={`P${duration}S`}>{formatTime(duration)}</time>
    </div>
  );
}
