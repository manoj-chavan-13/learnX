import React from "react";

export const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full bg-slate-900 border border-slate-700 rounded-xl py-3 text-white 
          placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
          focus:border-indigo-500/50 transition-all ${Icon ? "pl-10" : "px-4"}
        `}
      />
    </div>
  </div>
);
