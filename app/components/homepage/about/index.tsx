// @flow strict

import { personalData } from "@/utils/data/personal-data";
import { useTranslations } from "next-intl";
import Image from "next/image";

function AboutSection() {
  const t = useTranslations("aboutSection");
  return (
    <div id="about" className="my-12 lg:my-16 relative">
      <div className="hidden lg:flex items-center origin-right rotate-90 w-fit absolute right-5 bottom-0">
        <span className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md">
          {t("title")}
        </span>
        <span className="h-[2px] w-36 bg-[#1a1443]"></span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="font-medium mb-5 text-[#16f2b3] text-xl uppercase text-center lg:text-left">
            {t("subtitle")}
          </p>
          <p className="text-gray-200 text-sm lg:text-lg">
            {/* {personalData.description} */}
            {t("description")}
          </p>
        </div>
        <div className="flex justify-center items-center order-1 lg:order-2">
          <Image
            src={personalData.profile}
            priority
            width={280}
            height={280}
            alt={personalData.name}
            className="w-auto h-auto rounded-lg transition-all duration-1000 grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default AboutSection;
