import * as svgl from "@ridemountainpig/svgl-react";

function Tech({ skill }: { skill: svgl.SvglComponentName }) {
  const TechIcon = svgl[skill];

  return <TechIcon />;
}

export default Tech;
