import React from "react";
import cn from "classnames";

const Input = ({
  value,
  onChange,
  className,
  textarea,
  ...props
}: { textarea?: boolean } & React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
>) => {
  const Comp = textarea ? "textarea" : "input";
  return (
    <Comp
      value={value}
      onChange={onChange}
      className={cn(
        "bg-transparent border font-mono p-1 px-2 border-slate-700 flex-grow rounded",
        "focus:ring-4 focus:outline-none focus:ring-slate-700/50",
        className,
      )}
      {...props}
    />
  );
};

export default Input;
