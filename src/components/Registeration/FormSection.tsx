import React from "react";

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon, children }) => (
  <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 space-y-6">
    <div className="flex items-center gap-3 text-white mb-4">
      {icon}
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

export default FormSection;