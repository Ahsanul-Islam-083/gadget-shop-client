"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({
  targetHours = 24,
}: {
  targetHours?: number;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    // Set a rolling end time
    const endTime = Date.now() + targetHours * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetHours]);

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-xl font-bold text-amber-500 shadow-sm backdrop-blur dark:text-amber-400">
          {pad(timeLeft.hours)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">
          Hours
        </span>
      </div>
      <span className="text-xl font-bold text-amber-500">:</span>
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-xl font-bold text-amber-500 shadow-sm backdrop-blur dark:text-amber-400">
          {pad(timeLeft.minutes)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">
          Mins
        </span>
      </div>
      <span className="text-xl font-bold text-amber-500">:</span>
      <div className="flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-xl font-bold text-amber-500 shadow-sm backdrop-blur dark:text-amber-400">
          {pad(timeLeft.seconds)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-neutral-400">
          Secs
        </span>
      </div>
    </div>
  );
}
