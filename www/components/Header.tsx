/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import HeaderImage from "../public/mockbin-dark.svg";
import GitHubStars from "./GitHubStars";

const Header = () => {
  return (
    <header className="flex flex-row w-full justify-between items-center h-[52px]">
      <Link href="/" className="flex items-center">
        <Image
          height={28}
          alt="Mockbin"
          src={HeaderImage}
          className="h-7 w-auto"
        />
      </Link>
      <Link
        target="_blank"
        href="https://github.com/zuplo/mockbin"
        className="inline-flex items-center gap-2 h-9 pl-3 pr-1.5 rounded-lg border border-line bg-white text-[13px] font-semibold text-fg hover:bg-bg-subtle transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
        <span>GitHub</span>
        <GitHubStars repo="zuplo/mockbin" />
      </Link>
    </header>
  );
};
export default Header;
