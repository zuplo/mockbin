import { ReactNode } from "react";
import Header from "./Header";

export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-fg">
      <div className="w-full max-w-content mx-auto px-6 flex flex-col flex-1">
        <div className="flex-none">
          <Header />
        </div>
        <main className="flex-1 py-8">{children}</main>
        <footer className="py-6 border-t border-line">
          <p className="text-sm text-fg-muted text-center">
            Made with{" "}
            <span aria-hidden="true" className="text-accent">
              ♥
            </span>{" "}
            by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://zuplo.com/?c=mbf"
              className="font-semibold text-fg hover:text-accent transition-colors"
            >
              Zuplo
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
