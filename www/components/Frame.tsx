import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col bg-black text-white items-center w-screen h-screen justify-between">
      <div className="w-full h-full max-w-5xl px-4 flex flex-col">
        <div className="flex-none">
          <Header />
        </div>
        <div className="flex-grow">{children}</div>
        <div className="flex-none flex-row items-center justify-between py-3 w-full">
          <div>Made with ❤️ by zuplo</div>
        </div>
      </div>
    </div>
  );
}
