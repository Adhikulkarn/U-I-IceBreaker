import { useEffect, useMemo, useState } from "react";

export default function useCountdown(duration, startedAt) {
  const calculateSeconds = useMemo(
    () => () => {
      if (!duration || !startedAt) {
        return null;
      }

      const elapsed =
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);

      return Math.max(duration - elapsed, 0);
    },
    [duration, startedAt]
  );

  const [remainingSeconds, setRemainingSeconds] = useState(calculateSeconds);

  useEffect(() => {
    setRemainingSeconds(calculateSeconds());

    if (!duration || !startedAt) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds(calculateSeconds());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [calculateSeconds, duration, startedAt]);

  if (remainingSeconds === null) {
    return "--:--";
  }

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}
