import React from "react";
import clsx from "clsx";

export const Button = ({
  type,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type={type}
      className={clsx(
        // Default styles - width removed to allow override
        "bg-primary text-white rounded-md hover:bg-primary-hover active:scale-90 transition-all duration-100 ease-in-out cursor-pointer flex items-center justify-center",
        // Passed className has higher priority and will override defaults
        className
      )}
      {...props}
    />
  );
};
