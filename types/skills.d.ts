import { type SvglComponentName } from "@ridemountainpig/svgl-react";

type InputSkillItem =
  | SvglComponentName
  | { label: string; icon: SvglComponentName };

export type StandardizedSkillItem = {
  label: string;
  icon: SvglComponentName;
};

export type StandardizedCategorizedSkills = Record<
  string,
  StandardizedSkillItem[]
>;
