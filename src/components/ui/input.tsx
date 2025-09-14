import React from "react";
import clsx from "clsx";

export const Input = ({
  type,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={clsx(
        "border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary",
        className
      )}
      {...props}
    />
  );
};
