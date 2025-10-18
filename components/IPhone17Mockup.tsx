'use client';

import { ReactNode } from 'react';

interface IPhone17MockupProps {
  children: ReactNode;
  className?: string;
}

export function IPhone17Mockup({ children, className = '' }: IPhone17MockupProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative">
        {/* iPhone 17 Frame */}
        <div className="relative w-[390px] h-[844px] bg-black rounded-[60px] p-3 shadow-2xl">
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-white rounded-[48px] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[126px] bg-black rounded-full z-10 leading-[1.725/rem] h-6" />

            {/* Widget content area - allows horizontal scrolling for 3-card layout */}
            <div className="w-full h-full bg-white overflow-x-auto overflow-y-auto">
              <div className={`min-w-[600px] h-full ${className}`}>
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[120px] w-[3px] h-[32px] bg-black rounded-l-sm" />
        <div className="absolute -left-[3px] top-[180px] w-[3px] h-[62px] bg-black rounded-l-sm" />
        <div className="absolute -left-[3px] top-[250px] w-[3px] h-[62px] bg-black rounded-l-sm" />
        <div className="absolute -right-[3px] top-[200px] w-[3px] h-[82px] bg-black rounded-r-sm" />
      </div>
    </div>
  );
}
