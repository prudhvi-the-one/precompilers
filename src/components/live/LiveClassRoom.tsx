"use client";

import { useState } from "react";

export default function LiveClassRoom({
  roomUrl,
  displayName,
}: {
  roomUrl: string;
  displayName: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = `${roomUrl}?name=${encodeURIComponent(displayName)}`;

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1 bg-black">
        <iframe
          src={src}
          onLoad={() => setLoaded(true)}
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
