'use client';

import { ReactNode } from 'react';

interface IPhone17MockupProps {
  children: ReactNode;
}

export function IPhone17Mockup({ children }: IPhone17MockupProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative">
        {/* iPhone 17 Frame */}
        <div className="relative w-[390px] h-[844px] bg-black rounded-[60px] p-3 shadow-2xl">
          {/* Inner bezel */}
          <div className="relative w-full h-full bg-white rounded-[48px] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[126px] bg-black rounded-full z-10 leading-[1.725/rem] h-6" />

            {/* Widget content area - maintains original size */}
            <div className="w-full h-full bg-white overflow-auto">
              <div className="scale-[0.8] origin-top-left w-[125%] h-[125%]">
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
