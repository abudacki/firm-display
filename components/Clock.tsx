"use client";

import { useEffect, useState } from "react";

function getNow() {
  return new Date();
}

export function Clock() {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(getNow()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div aria-live="polite">
      <div className="text-[clamp(4rem,10vw,9rem)] font-semibold leading-none">{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
      <div className="mt-4 text-3xl font-medium text-white/82">
        {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}
