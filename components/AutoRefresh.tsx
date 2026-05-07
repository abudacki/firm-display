"use client";

import { useEffect } from "react";

export function AutoRefresh({ seconds }: { seconds: number }) {
  useEffect(() => {
    const timer = window.setInterval(() => window.location.reload(), Math.max(seconds, 10) * 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  return null;
}
