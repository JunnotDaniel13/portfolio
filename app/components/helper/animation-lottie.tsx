"use client";

import Lottie from "lottie-react";

const AnimationLottie = ({ animationPath, width }: { animationPath: any, width?: number }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationPath,
    style: {
      width: '95%',
    }
  };

  return (
    <Lottie {...defaultOptions} />
  );
};

export default AnimationLottie;