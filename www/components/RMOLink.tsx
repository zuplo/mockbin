import ZuploLogo from "@/components/ZuploLogo";

const RMOLink = () => {
  return (
    <a
      href="https://ratemyopenapi.com"
      target="_blank"
      className="bg-gray-100 hover:bg-gray-200 text-[#333] h-[29px] p-2 py-[4px] rounded-[4px] font-bold flex gap-1 items-center duration-200"
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
