"use client";

import React, { useEffect, useRef } from "react";

export interface AstroDitherProps {
  className?: string;
  src?: string;
}

export function AstroDither({
  className = "w-full h-screen border-none",
  src = "/sites/astrodither/index.html",
}: AstroDitherProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Optional focus management or message bridging
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#080808] overflow-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        title="AstroDither"
        className={className}
        allow="autoplay"
        style={{ border: "none", width: "100%", height: "100vh" }}
      />
    </div>
  );
}

export default AstroDither;
