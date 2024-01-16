import React from "react";
import cn from "classnames";

export type MergeWithAs<
  Comp extends React.ElementType,
  Props extends {} = {},
> = Omit<Props, "as"> & { as?: Comp };

export type ComponentPropsWithAs<
  Comp extends React.ElementType,
  Props extends {} = {},
> = Omit<React.ComponentPropsWithoutRef<Comp>, keyof MergeWithAs<Comp, Props>> &
  MergeWithAs<Comp, Props>;

const Button = <T extends React.ElementType = "button">({
  as,
  className,
  ...props
}: ComponentPropsWithAs<T>) => {
  const Component = as ?? "button";

  return (
    <Component
      className={cn(
        "relative rounded-md px-4 py-1 text-sm font-medium bg-gradient-to-b from-[#FF00BD] to-[#C0008F] transition-transform",
        "hover:scale-105",
        "focus:ring-4 focus:outline-none focus:ring-[#C0008F]/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

export default Button;
