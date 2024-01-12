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
    <button className="px-4" onClick={onRefresh}>
      <RefreshIcon />
    </button>
  </header>
);
export default BinHeader;
