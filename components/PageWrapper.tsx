import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actionButton?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title, className = '', actionButton }) => {
  return (
    <div className={`p-4 pb-20 bg-calm-blue-secondary min-h-screen ${className}`}>
      <div className="flex justify-between items-center mb-6">
        {title && <h1 className="text-2xl font-bold text-calm-blue-primary">{title}</h1>}
        {actionButton && <div>{actionButton}</div>}
      </div>
      {children}
    </div>
  );
};

export default PageWrapper;