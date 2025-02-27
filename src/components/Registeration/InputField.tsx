import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: { message?: string };
  type?: string;
  placeholder?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  register,
  error,
  type = "text",
  placeholder,
  className,
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      {...register}
      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
      placeholder={placeholder}
    />
    {error && <p className="mt-1 text-red-400 text-sm">{error.message}</p>}
  </div>
);

export default InputField;