import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  badge,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
