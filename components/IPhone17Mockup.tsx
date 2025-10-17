'use client';

import { ReactNode } from 'react';

interface IPhone17MockupProps {
  children: ReactNode;
}

export function IPhone17Mockup({ children }: IPhone17MockupProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="relative w-full max-w-[390px] h-auto">
        {/* iPhone 17 Frame - Responsive */}
        <div className="relative w-full aspect-[390/844] bg-black rounded-[15%] p-[0.8%] shadow-2xl">
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-white rounded-[12%] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[32%] bg-black rounded-full z-10 h-[2.5%]" />

            {/* Widget content area - flexible and responsive */}
            <div className="w-full h-full bg-white overflow-auto">
              <div className="w-full h-full">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Side buttons - Responsive */}
        <div className="absolute -left-[0.8%] top-[14%] w-[0.8%] h-[3.8%] bg-black rounded-l-sm" />
        <div className="absolute -left-[0.8%] top-[21%] w-[0.8%] h-[7.3%] bg-black rounded-l-sm" />
        <div className="absolute -left-[0.8%] top-[29%] w-[0.8%] h-[7.3%] bg-black rounded-l-sm" />
        <div className="absolute -right-[0.8%] top-[23%] w-[0.8%] h-[9.7%] bg-black rounded-r-sm" />
      </div>
    </div>
  );
}
