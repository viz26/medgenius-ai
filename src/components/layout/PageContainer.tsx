import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="min-h-full w-full bg-gradient-to-b from-white to-gray-50 pt-20">
      {children}
    </div>
  );
};

export default PageContainer; 