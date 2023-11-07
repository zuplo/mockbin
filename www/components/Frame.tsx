import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-[#000019] flex-col text-white items-center w-[95%] md:max-w-3xl mx-auto min-h-screen h-full my-20 justify-between">
      <div className="w-full h-full min-h-screen max-w-5xl px-4 flex flex-col">
        <div className="flex-none">
          <Header />
        </div>
        <div className="flex-grow">{children}</div>
        <div className="flex-none flex-row items-center justify-between py-3 w-full self-end justify-self-end">
          <a target="_blank" href="https://zuplo.com" className="text-xl">
            Made with ❤️ by{" "}
            <span className="underline font-bold text-[#FF00BD]">Zuplo</span>
          </a>
          <div className="sm:hidden ml-1">
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
