import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#000019] flex-col text-white items-center w-[95%] md:max-w-7xl mx-auto min-h-screen h-full  justify-between">
      <div className="w-full h-full min-h-screen max-w-5xl px-4 flex flex-col">
        <div className="flex-none mt-4 sm:mt-16">
          <Header />
        </div>
        <div className="flex-grow">{children}</div>
        <div className="flex sm:flex-none flex-row py-3 w-full self-end justify-self-end mt-4 sm:mt-20">
          <a target="_blank" href="https://zuplo.com" className="text-xl">
            Made with ❤️ by{" "}
            <span className="underline font-bold text-[#FF00BD]">Zuplo</span>
          </a>
          <div className="sm:hidden text-xl ml-1">
            &middot;{" "}
            <a
              href="https://discord.gg/s8QHDPerbE"
              className="text-[#5865F2]"
              target="_blank"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
