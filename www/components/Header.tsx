/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import HeaderImage from "../public/mockbin-white.svg";

const Header = () => {
  return (
    <header className="flex flex-row w-full justify-between items-center">
      <Link href="/">
        <Image
          height={40}
          alt="mockbin logo"
          src={HeaderImage}
          className="py-4"
        />
      </Link>
      <div className="flex gap-x-2 items-center">
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
