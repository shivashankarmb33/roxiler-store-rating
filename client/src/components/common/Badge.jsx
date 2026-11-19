import React from 'react';

export const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    USER: 'bg-blue-50 text-blue-700 border-blue-200',
    STORE_OWNER: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const labels = {
    ADMIN: 'System Admin',
    USER: 'Normal User',
    STORE_OWNER: 'Store Owner'
  };

  const currentStyle = styles[role] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = labels[role] || role;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {label}
    </span>
  );
};

