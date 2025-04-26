"use client";

import { StandardizedSkillItem } from "@/types/skills";
import { categorizedSkills } from "@/utils/data/skills";
import Marquee from "react-fast-marquee";
import Tech from "../../helper/tech";
import Link from "next/link";
import * as svgl from "@ridemountainpig/svgl-react";

function Skills() {
  const MIN_SKILLS_FOR_MARQUEE = 6;

  return (
    <div
      id="skills"
      className="relative z-50 border-t my-12 lg:my-24 border-[#25213b]"
    >
      <div className="w-[100px] h-[100px] bg-violet-100 rounded-full absolute top-6 left-[42%] translate-x-1/2 filter blur-3xl opacity-20"></div>
      <div className="flex justify-center -translate-y-[1px]">
        <div className="w-3/4">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent w-full" />
        </div>
      </div>

      <div className="flex justify-center my-5 lg:py-8">
        <div className="flex items-center">
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
          <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
            Skills
          </span>
          <span className="w-24 h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8">
        {Object.entries(categorizedSkills).map(
          ([category, skillsInCategory], index) => {
            const useMarquee =
              skillsInCategory.length >= MIN_SKILLS_FOR_MARQUEE;

            return (
              <div key={index} className="mb-10 lg:mb-16">
                <h3 className="text-xl lg:text-2xl text-center font-semibold text-white mb-6 lg:mb-8">
                  {category}
                </h3>

                {useMarquee ? (
                  <div className="w-full">
                    {" "}
                    <Marquee
                      gradient={false}
                      speed={80}
                      pauseOnHover={true}
                      pauseOnClick={true}
                      delay={0}
                      play={true}
                      direction="left"
                    >
                      {skillsInCategory.map((skill, id) => (
                        <SkillCard skill={skill} key={`${category}-mq-${id}`} />
                      ))}
                    </Marquee>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6">
                    {skillsInCategory.map((skill, id) => (
                      <SkillCard skill={skill} key={`${category}-st-${id}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: StandardizedSkillItem }) {
  return (
    <div className="w-36 min-w-fit h-fit flex flex-col items-center justify-center transition-all duration-500 m-3 sm:m-5 rounded-lg group relative hover:scale-[1.15] cursor-pointer">
      <div className="h-full w-full rounded-lg border border-[#1f223c] bg-[#11152c] shadow-none shadow-gray-50 group-hover:border-violet-500 transition-all duration-500">
        <div className="flex -translate-y-[1px] justify-center">
          <div className="w-3/4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          </div>
        </div>
        <Link href={svgl[`${skill.icon}Url`]} target="_blank">
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
              <Tech skill={skill.icon} />
            </div>
            <p className="text-white text-sm sm:text-lg">{skill.label}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Skills;
