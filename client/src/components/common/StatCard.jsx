import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo'
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    }
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-[#E2E8F0] hover:shadow-popover transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${style.bg} ${style.text} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center text-xs text-[#64748B]">
          {subtitle}
        </div>
      )}
    </div>
  );
};
