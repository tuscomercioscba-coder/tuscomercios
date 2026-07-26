import { useEffect, useRef } from "react";
import { getAudioGain } from "./audioUtils";

export default function AudioPreview({
  track,
  currentTime,
  playing,
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.url) return;

    const active =
      currentTime >= track.start &&
      currentTime <= track.end;

    const targetTime =
      Math.max(
        0,
        Number(track.sourceStart || 0) +
          (currentTime - track.start)
      );

    audio.volume = getAudioGain(track, currentTime);

    if (!active) {
      audio.pause();
      return;
    }

    if (
      Math.abs(audio.currentTime - targetTime) >
      0.2
    ) {
      try {
        audio.currentTime = targetTime;
      } catch {}
    }

    if (playing) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [track, currentTime, playing]);

  if (!track?.url) return null;

  return (
    <audio
      ref={audioRef}
      src={track.url}
      preload="auto"
    />
  );
}
