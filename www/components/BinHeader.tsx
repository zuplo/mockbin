import Link from "next/link";
import Image from "next/image";
import HeaderImage from "@/public/mockbin-dark.svg";
import CopyButton from "@/components/CopyButton";
import RefreshIcon from "@/components/RefreshIcon";
import ArrowIcon from "@/components/ArrowIcon";
import cn from "classnames";
import Button from "@/components/Button";
import DocsButton from "./DocsButton";

const BinHeader = ({
  isOas,
  docsUrl,
  binUrl,
  onRefresh,
  isNewBin,
}: {
  isOas: boolean;
  docsUrl: string;
  binUrl: string;
  onRefresh: () => void;
  isNewBin: boolean;
}) => (
  <header className="h-[52px] sticky top-0 z-30 flex bg-white border-b border-line items-center">
    <Link
      href="/"
      className="flex gap-2 items-center px-4 group flex-shrink-0 text-fg-muted hover:text-accent transition-colors"
      aria-label="Back to home"
    >
      <ArrowIcon className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
      <Image
        alt="Mockbin"
        height={24}
        src={HeaderImage}
        className="h-6 w-auto"
      />
    </Link>
    <div
      className={cn(
        "flex-grow min-w-0 px-4 py-2 flex items-center gap-2 text-sm",
        isNewBin && "invisible",
      )}
    >
      <span className="whitespace-nowrap hidden md:block text-fg-muted text-[13px]">
        Live at
      </span>
      <code
        className="inline-flex items-center bg-bg-muted rounded-lg border border-line px-2.5 py-1 text-fg font-mono text-[12px] truncate max-w-full"
        title={binUrl}
      >
        {binUrl}
      </code>
      <CopyButton textToCopy={binUrl} />
      {isOas && <DocsButton docsUrl={docsUrl} />}
    </div>
    <div className="flex gap-2 px-4 items-center">
      <button
        type="button"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
        onClick={onRefresh}
        aria-label="Refresh"
      >
        <RefreshIcon />
      </button>
      <Button as="a" tabIndex={0} href="/">
        New Bin
      </Button>
    </div>
  </header>
);
export default BinHeader;
