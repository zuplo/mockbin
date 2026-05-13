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
        "w-full bg-white text-fg font-mono text-[13px] leading-5",
        "border-[1.5px] border-line rounded-lg",
        "px-3 py-2",
        !textarea && "h-9",
        "placeholder:text-fg-faint",
        "transition-colors",
        "hover:border-line-strong",
        "focus:outline-none focus:border-accent focus:shadow-focus",
        "disabled:cursor-not-allowed disabled:bg-bg-muted disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
