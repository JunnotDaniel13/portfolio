import * as svgl from "@ridemountainpig/svgl-react";

export const skillsImage = (skill: svgl.SvglComponentName) => {
  return svgl[skill];
};
