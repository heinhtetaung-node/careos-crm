import React, { useEffect, useRef } from 'react';
import { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { getString } from 'presentation/theme/localization';

interface CustomAudioVisualizerProps {
  trackRef: TrackReferenceOrPlaceholder;
  barCount?: number;
  height?: number;
}

// Custom Audio Visualizer Component using Web Audio API
function CustomAudioVisualizer(props: Readonly<CustomAudioVisualizerProps>) {
  const { trackRef, barCount = 20, height = 100 } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const track = trackRef?.publication?.track;
    let shouldCleanupFunc = () => {};

    if (!track || !canvasRef.current) return shouldCleanupFunc;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return shouldCleanupFunc;

    try {
      // Get MediaStreamTrack from LiveKit track
      // Try different ways to access the track
      let mediaStreamTrack: MediaStreamTrack | null = null;

      // Method 1: Direct access
      if (track.mediaStreamTrack) {
        mediaStreamTrack = track.mediaStreamTrack;
      }
      // Method 2: From track's underlying track
      else if ((track as any).track) {
        mediaStreamTrack = (track as any).track;
      }
      // Method 3: Try to get from MediaStream
      else if ((track as any).mediaStream) {
        const stream = (track as any).mediaStream as MediaStream;
        mediaStreamTrack = stream.getAudioTracks()[0] || null;
      }

      if (!mediaStreamTrack) {
        console.warn(getString('performanceStatistic.noMediaStreamTrack'));
        return shouldCleanupFunc;
      }

      // Create audio context and analyser
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(
        new MediaStream([mediaStreamTrack])
      );
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgb(240, 240, 240)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bars
        const barWidth = canvas.width / barCount;
        let x = 0;

        for (let i = 0; i < barCount; i += 1) {
          // Get frequency data for this bar
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const barHeight = (dataArray[dataIndex] / 255) * canvas.height;

          // Create gradient
          const gradient = ctx.createLinearGradient(
            0,
            canvas.height - barHeight,
            0,
            canvas.height
          );
          gradient.addColorStop(0, '#86efac'); // Light green
          gradient.addColorStop(0.5, '#4ade80'); // Medium green
          gradient.addColorStop(1, '#22c55e'); // Normal green

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (error) {
      console.error(
        getString('performanceStatistic.errorSettingUpVisualizer'),
        error
      );
    }

    shouldCleanupFunc = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };

    return shouldCleanupFunc;
  }, [trackRef, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={height}
      className="w-full block rounded"
    />
  );
}

export default CustomAudioVisualizer;
