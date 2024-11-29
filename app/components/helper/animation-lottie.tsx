"use client";
import Script from "next/script";
import React, { useRef, useEffect, memo } from "react";

const AnimationLottie = ({ animationPath }: { animationPath: unknown }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      import("lottie-web").then((lottie) => {
        lottie.default.loadAnimation({
          container: containerRef.current as HTMLDivElement,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: animationPath,
        });
      });
    }
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js"
        strategy="lazyOnload"
      />
      <div ref={containerRef} />
    </>
  );
};

export default AnimationLottie;
