import Image from "next/image";

const Header = () => {
  return (
    <header className="flex flex-row w-full justify-between items-center">
      <a href="https://mockbin.io">
        <Image
          width={360}
          height={132}
          alt="mockbin logo"
          src="/mockbin-header.png"
        />
      </a>
      <a
        href="https://github.com/zuplo-samples/mockbin"
        target="_blank"
      >
        <Image
          className="h-fit"
          width={30}
          height={30}
          alt="github logo"
          src="/github-mark-white.png"
        />
      </a>
    
      
    </header>
  );
};
export default Header;
