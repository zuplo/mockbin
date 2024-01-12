import Link from "next/link";
import Image from "next/image";
import HeaderImage from "@/public/mockbin-header-small.png";
import CopyButton from "@/components/CopyButton";
import RefreshIcon from "@/components/RefreshIcon";
import ArrowIcon from "@/components/ArrowIcon";
import cn from "classnames";

const BinHeader = ({
  binUrl,
  onRefresh,
  isNewBin,
}: {
  binUrl: string;
  onRefresh: () => void;
  isNewBin: boolean;
}) => (
  <header className="h-[60px] sticky top-0 flex bg-[#000019] items-center">
    <Link href="/" className="flex gap-1 items-center px-4 group ease-in-out">
      <ArrowIcon className="rotate-180 text-[#FF00BD] group-hover:scale-125 transition-transform" />
      <Image alt="mockbin logo" height={50} src={HeaderImage} />
    </Link>
    <div
      className={cn(
        "flex-grow px-4 py-2 flex items-center gap-2 text-sm",
        isNewBin && "invisible",
      )}
    >
      Your Bin is live at
      <code className="bg-slate-800 rounded border border-slate-700 bg px-2 py-1 text-[#FF00BD]">
        {binUrl}
      </code>
      <CopyButton textToCopy={binUrl} />
    </div>
    <div className="flex gap-4 px-4 items-center">
      <Link
        tabIndex={0}
        href="/"
        className={cn(
          "relative rounded-md px-4 py-1 text-sm font-medium bg-gradient-to-b from-[#FF00BD] to-[#C0008F] opacity-85 transition-transform",
          "hover:opacity-100 hover:scale-105",
          "focus:ring-4 focus:outline-none focus:ring-[#C0008F]/50",
        )}
      >
        Create Bin
      </Link>
      <button
        className="px-2 py-2 hover:bg-slate-800 rounded"
        onClick={onRefresh}
      >
        <RefreshIcon />
      </button>
    </div>
  </header>
);
export default BinHeader;
