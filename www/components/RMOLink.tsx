import ZuploLogo from "@/components/ZuploLogo";
import cn from "classnames";

const RMOLink = ({ className }: { className?: string }) => {
  return (
    <a
      href="https://ratemyopenapi.com"
      target="_blank"
      className={cn(
        "hidden md:flex gap-1 items-center bg-gray-100 hover:bg-gray-200 text-[#333] h-[29px] p-2 py-[4px] rounded-[4px] font-bold duration-200",
        className,
      )}
      title="ratemyopenapi - Upload your OpenAPI. We rate it."
    >
      <ZuploLogo width={16} height={16} />
      <span>
        rate<span className="text-gray-500">my</span>openapi
      </span>
    </a>
  );
};

export default RMOLink;
