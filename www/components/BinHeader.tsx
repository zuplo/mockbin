import Link from "next/link";
import Image from "next/image";
import HeaderImage from "@/public/mockbin-header.png";
import CopyButton from "@/components/CopyButton";
import SelectOnClick from "@/components/SelectOnClick";
import RefreshIcon from "@/components/RefreshIcon";

const BinHeader = ({
  binUrl,
  onRefresh,
}: {
  binUrl: string;
  onRefresh: () => void;
}) => (
  <header className="h-[60px] sticky top-0 flex bg-[#000019] items-center">
    <Link href="/">
      <Image alt="mockbin logo" height={60} src={HeaderImage} />
    </Link>
    <div className="flex-grow px-4 py-2 flex items-center gap-2 text-sm">
      Your bin is live at
      <SelectOnClick>
        <code className="bg-slate-800 rounded border border-slate-700 bg px-2 py-1 text-[#FF00BD]">
          {binUrl}
        </code>
      </SelectOnClick>
      <CopyButton textToCopy={binUrl} />
    </div>
    <button className="px-4" onClick={onRefresh}>
      <RefreshIcon />
    </button>
  </header>
);
export default BinHeader;
