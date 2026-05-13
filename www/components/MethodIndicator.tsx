type MethodKey = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "DEFAULT";

const methodTagClasses: Record<MethodKey, string> = {
  GET: "bg-info/10 text-info border-info/30",
  POST: "bg-success-bg text-success border-success/30",
  PUT: "bg-warn-bg text-warn-text border-warn-border",
  PATCH: "bg-warn-bg text-warn-text border-warn-border",
  DELETE: "bg-danger-bg text-danger border-danger/30",
  DEFAULT: "bg-bg-muted text-fg-muted border-line",
};

const methodDotClasses: Record<MethodKey, string> = {
  GET: "bg-info",
  POST: "bg-success",
  PUT: "bg-warn",
  PATCH: "bg-warn",
  DELETE: "bg-danger",
  DEFAULT: "bg-fg-faint",
};

const methodTextClasses: Record<MethodKey, string> = {
  GET: "text-info",
  POST: "text-success",
  PUT: "text-warn-text",
  PATCH: "text-warn-text",
  DELETE: "text-danger",
  DEFAULT: "text-fg-muted",
};

const normalize = (method: string): MethodKey => {
  const upper = method.toUpperCase();
  if (upper in methodTagClasses) {
    return upper as MethodKey;
  }
  return "DEFAULT";
};

export const getMethodBgColor = (method: string) =>
  methodDotClasses[normalize(method)];
export const getMethodTextColor = (method: string) =>
  methodTextClasses[normalize(method)];

const MethodIndicator = ({ method }: { method: string }) => {
  const key = normalize(method);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-tag border px-1.5 py-px text-[11px] font-semibold uppercase tracking-wide ${methodTagClasses[key]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${methodDotClasses[key]}`} />
      {method.toUpperCase()}
    </span>
  );
};

export default MethodIndicator;
