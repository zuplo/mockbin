import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col bg-black text-white items-center w-screen min-h-screen h-full justify-between">
      <div className="w-full h-full min-h-screen max-w-5xl px-4 flex flex-col">
        <div className="flex-none">
          <Header />
        </div>
        <div className="flex-grow">{children}</div>
        <div className="flex-none flex-row items-center justify-between py-3 w-full self-end justify-self-end">
          <a target="_blank" href="https://zuplo.com">
            Made with ❤️ by zuplo
          </a>
        </div>
      </div>
    </div>
  );
}
