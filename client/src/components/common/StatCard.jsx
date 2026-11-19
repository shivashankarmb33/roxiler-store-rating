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
      accent: 'text-indigo-900'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      accent: 'text-emerald-900'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      accent: 'text-amber-900'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      accent: 'text-blue-900'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      accent: 'text-purple-900'
    }
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};
