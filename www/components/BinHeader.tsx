import Link from "next/link";
import Image from "next/image";
import HeaderImage from "@/public/mockbin-header-small.png";
import CopyButton from "@/components/CopyButton";
import RefreshIcon from "@/components/RefreshIcon";
import ArrowIcon from "@/components/ArrowIcon";
import cn from "classnames";
import Button from "@/components/Button";

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
    <Link
      href="/"
      className="flex gap-1 items-center px-4 group ease-in-out flex-shrink-0"
    >
      <ArrowIcon className="rotate-180 text-[#FF00BD] group-hover:scale-125 transition-transform" />
      <Image alt="mockbin logo" height={50} src={HeaderImage} />
    </Link>
    <div
      className={cn(
        "flex-grow min-w-0 px-4 py-2 flex items-center gap-2 text-sm",
        isNewBin && "invisible",
      )}
    >
      <span className="whitespace-nowrap">Live at</span>
      <code
        className="bg-slate-800 rounded border border-slate-700 bg px-2 py-1 text-[#FF00BD] truncate"
        title={binUrl}
      >
        {binUrl}
      </code>
      <CopyButton textToCopy={binUrl} />
    </div>
    <div className="flex gap-4 px-4 items-center">
      <Button as="a" tabIndex={0} className="whitespace-nowrap" href="/">
        Create Bin
      </Button>
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
