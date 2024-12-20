import Link from "next/link";
import { personalData } from "@/utils/data/personal-data";
import LocaleSwitcher from "./helper/locale-switcher";
import { useTranslations } from "next-intl";

function Navbar() {
  const t = useTranslations("navigation");
  return (
    <nav className="fixed top-0 w-full h-28 z-[99] bg-transparent bg-[radial-gradient(transparent_1px,rgb(13,18,36)_1px)] bg-[length:4px_4px] backdrop-blur-[3px] opacity-100 [mask:linear-gradient(rgb(0,0,0)_60%,rgba(0,0,0,0)_100%)]">
      <div className="flex items-center justify-between py-5 mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem]">
        <div className="flex flex-shrink-0 items-center">
          <Link
            href="/"
            className=" text-[#16f2b3] text-3xl font-bold uppercase"
          >
            {personalData.name}
          </Link>
        </div>

        <ul
          className="mt-4 flex h-screen max-h-0 w-full flex-col items-start text-sm opacity-0 md:mt-0 md:h-auto md:max-h-screen md:w-auto md:flex-row md:space-x-1 md:border-0 md:opacity-100"
          id="navbar-default"
        >
          <li>
            <Link
              className="block px-4 py-2 no-underline outline-none hover:no-underline"
              href="/#about"
            >
              <div className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                {t("about")}
              </div>
            </Link>
          </li>
          <li>
            <Link
              className="block px-4 py-2 no-underline outline-none hover:no-underline"
              href="/#experience"
            >
              <div className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                {t("experience")}
              </div>
            </Link>
          </li>
          <li>
            <Link
              className="block px-4 py-2 no-underline outline-none hover:no-underline"
              href="/#skills"
            >
              <div className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                {t("skills")}
              </div>
            </Link>
          </li>
          <li>
            <Link
              className="block px-4 py-2 no-underline outline-none hover:no-underline"
              href="/#education"
            >
              <div className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                {t("education")}
              </div>
            </Link>
          </li>

          <li>
            <Link
              className="block px-4 py-2 no-underline outline-none hover:no-underline"
              href="/#projects"
            >
              <div className="text-sm text-white transition-colors duration-300 hover:text-pink-600">
                {t("projects")}
              </div>
            </Link>
          </li>
          <li>
            <LocaleSwitcher />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
