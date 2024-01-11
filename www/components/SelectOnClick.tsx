import { type ReactNode } from "react";

const SelectOnClick = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <button
    className={className}
    onClick={(e) => {
      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(e.currentTarget);

      selection?.removeAllRanges();
      selection?.addRange(range);
    }}
  >
    {children}
  </button>
);

export default SelectOnClick;
