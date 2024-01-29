import React from "react";
import cn from "classnames";

type InputProps = {
  textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ value, onChange, className, textarea, ...props }, ref) => {
  const Comp = textarea ? "textarea" : "input";
  return (
    <Comp
      ref={ref as any}
      value={value}
      onChange={onChange}
      className={cn(
        "bg-transparent border font-mono p-1 px-2 border-slate-700 flex-grow rounded",
        "focus:ring-4 focus:outline-none focus:ring-slate-700/50 hover:bg-black/25",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
