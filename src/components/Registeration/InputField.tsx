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
    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{label}</label>
    <input
      type={type}
      {...register}
      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm"
      placeholder={placeholder}
    />
    {error && (
      <p className="mt-1 text-red-400 text-xs sm:text-sm animate-fade-in">
        {error.message}
      </p>
    )}
  </div>
);

export default InputField;

<style>{`
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  /* Responsive Adjustments for Small Devices */
  @media (max-width: 640px) {
    .text-sm {
      font-size: 0.75rem;
    }
    .text-xs {
      font-size: 0.65rem;
    }
    .mb-2 {
      margin-bottom: 0.25rem;
    }
    .mb-1 {
      margin-bottom: 0.125rem;
    }
    .px-4 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .px-3 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    .py-1\.5 {
      padding-top: 0.375rem;
      padding-bottom: 0.375rem;
    }
    .mt-1 {
      margin-top: 0.125rem;
    }
    input {
      font-size: 0.75rem;
    }
  }
`}</style>;