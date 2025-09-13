import clsx from "clsx";
import { X } from "lucide-react";

interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
  variant?: "default" | "primary" | "success" | "danger" | "warning";
}

export const Chip = ({
  label,
  onRemove,
  className,
  variant = "default",
  ...props
}: ChipProps) => {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    primary: "bg-blue-100 text-blue-800 border-blue-200",
    success: "bg-green-100 text-green-800 border-green-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div
      className={clsx(
        // Base styles
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 ease-in-out",
        // Variant styles
        variantStyles[variant],
        // Custom className
        className
      )}
      {...props}
    >
      <span className="truncate">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black hover:text-white transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-gray-400"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
