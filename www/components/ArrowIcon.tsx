import cn from "classnames";

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-chevron-right", className)}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default ArrowIcon;
