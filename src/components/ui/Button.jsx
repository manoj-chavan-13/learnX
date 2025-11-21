import React from "react";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  icon: Icon,
  type = "button",
  fullWidth = false,
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500/50",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    ghost: "hover:bg-slate-800/50 text-slate-400 hover:text-white",
    google:
      "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};
