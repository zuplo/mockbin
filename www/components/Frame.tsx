import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col bg-[#000019] items-center h-screen">
      <div className="w-full h-full max-w-5xl px-4 flex flex-col text-white">
        <div className="flex-none">
          <Header />
        </div>
        <div className="flex-grow">{children}</div>
        <div className="flex flex-row py-3 w-full justify-between mt-4">
          <a target="_blank" href="https://zuplo.com/?c=mbf" className="text-xl">
            Made with ❤️ by{" "}
            <span className="underline font-bold text-[#FF00BD]">Zuplo</span>
          </a>
          <div className="sm:hidden text-xl ml-1">
            <a
              href="https://discord.gg/s8QHDPerbE"
              className="text-[#5865F2]"
              target="_blank"
            >
              Join our Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
