/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import HeaderImage from "../public/mockbin-header.png";
import RMOLink from "@/components/RMOLink";

const Header = () => {
  return (
    <header className="flex flex-row w-full justify-between items-center">
      <Link href="/">
        <Image width={360} height={132} alt="mockbin logo" src={HeaderImage} />
      </Link>
      <div className="flex gap-x-2 items-center">
        <a href="https://github.com/zuplo/mockbin" target="_blank">
          <img
            alt="GitHub Repo stars"
            src="https://img.shields.io/github/stars/zuplo/mockbin?link=https%3A%2F%2Fgithub.com%2Fzuplo%2Fmockbin"
          />
        </a>
        <RMOLink />
        <a
          target="_blank"
          className="hidden sm:flex items-center gap-x-1 bg-[#5865F2] h-[31px] border border-[#464ec7] hover:bg-[#464ec7] p-2 py-[4px] rounded-[4px]"
          href="https://discord.zuplo.com"
        >
          <Image
            className="h-[16px] w-auto"
            height={16}
            width={16}
            alt="Discord"
            src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg"
          />
          <p className="text-white text-sm font-semibold">Discord</p>
        </a>
      </div>
    </header>
  );
};
export default Header;
