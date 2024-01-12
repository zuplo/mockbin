export const getMethodBgColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-700";
    case "POST":
      return "bg-green-700";
    case "PATCH":
      return "bg-amber-600";
    case "PUT":
      return "bg-purple-700";
    case "DELETE":
      return "bg-red-700";
    default:
      return "bg-gray-500";
  }
};

export const getMethodTextColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-blue-600";
    case "POST":
      return "text-green-600";
    case "PATCH":
      return "text-amber-500";
    case "PUT":
      return "text-purple-600";
    case "DELETE":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
};

const MethodIndicator = ({ method }: { method: string }) => {
  const color = getMethodBgColor(method);

  return (
    <div className={`font-bold flex items-center gap-2`}>
      <div className={`w-2 h-2 rounded-full ${color}`} />
      {method.toUpperCase()}
    </div>
  );
};

export default MethodIndicator;
