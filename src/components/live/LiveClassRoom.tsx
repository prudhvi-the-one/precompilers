"use client";

import { useState } from "react";

export default function LiveClassRoom({
  liveClassId,
  roomUrl,
  displayName,
}: {
  liveClassId: string;
  roomUrl: string;
  displayName: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = `${roomUrl}?name=${encodeURIComponent(displayName)}`;

  function handleLoad() {
    setLoaded(true);
    fetch(`/api/live-classes/${liveClassId}/attend`, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1 bg-black">
        <iframe
          src={src}
          onLoad={handleLoad}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="absolute inset-0 h-full w-full border-0"
        />
        {!loaded ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-[#7A7A96]">
            Connecting…
          </p>
        ) : null}
      </div>
    </div>
  );
}
