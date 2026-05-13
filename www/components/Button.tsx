import React from "react";
import cn from "classnames";

export type ButtonVariant = "primary" | "dark" | "outlined" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type MergeWithAs<
  Comp extends React.ElementType,
  Props extends {} = {},
> = Omit<Props, "as"> & { as?: Comp };

export type ComponentPropsWithAs<
  Comp extends React.ElementType,
  Props extends {} = {},
> = Omit<React.ComponentPropsWithoutRef<Comp>, keyof MergeWithAs<Comp, Props>> &
  MergeWithAs<Comp, Props> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-accent focus-visible:ring-accent/30",
  dark:
    "bg-fg text-white hover:bg-fg-secondary focus-visible:ring-fg/30",
  outlined:
    "bg-white text-fg-secondary border border-line hover:bg-bg-muted focus-visible:ring-accent/20",
  ghost:
    "bg-transparent text-fg-secondary hover:bg-bg-muted focus-visible:ring-accent/20",
  danger:
    "bg-danger text-white hover:bg-rose-700 focus-visible:ring-danger/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-[13px]",
  lg: "h-10 px-5 text-sm",
};

const Button = <T extends React.ElementType = "button">({
  as,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentPropsWithAs<T>) => {
  const Component = as ?? "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
};

export default Button;
