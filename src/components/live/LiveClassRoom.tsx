"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => {
      executeCommand: (command: string, ...args: unknown[]) => void;
      dispose: () => void;
    };
  }
}

export default function LiveClassRoom({
  roomUrl,
  displayName,
}: {
  roomUrl: string;
  displayName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<InstanceType<typeof window.JitsiMeetExternalAPI> | null>(
    null
  );
  const [dataLight, setDataLight] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const url = new URL(roomUrl);
    const domain = url.hostname;
    const roomName = url.pathname.replace(/^\//, "");

    function init() {
      if (cancelled || !containerRef.current) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: containerRef.current,
          userInfo: { displayName },
          width: "100%",
          height: "100%",
          configOverwrite: { prejoinPageEnabled: false },
        });
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    if (window.JitsiMeetExternalAPI) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = init;
      script.onerror = () => setStatus("error");
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
    };
  }, [roomUrl, displayName]);

  function toggleDataLight() {
    apiRef.current?.executeCommand("toggleVideo");
    setDataLight((v) => !v);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1 bg-black">
        <div ref={containerRef} className="absolute inset-0" />
        {status === "loading" ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-[#7A7A96]">
            Connecting…
          </p>
        ) : null}
        {status === "error" ? (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-[#7A7A96]">
            Couldn&apos;t load the video room. Check your connection and
            reload.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-[#23243D] bg-[#0F1020] px-6 py-3">
        <button
          type="button"
          onClick={toggleDataLight}
          disabled={status !== "ready"}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${
            dataLight
              ? "border-[#A5A0FF] bg-[#A5A0FF]/10 text-[#A5A0FF]"
              : "border-[#33344F] text-[#C6C6DC] hover:bg-[#1B1C33]"
          }`}
        >
          {dataLight ? "Data-light mode: on (audio only)" : "Data-light mode"}
        </button>
      </div>
    </div>
  );
}
