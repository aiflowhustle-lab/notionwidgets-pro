'use client';

import IPhone17Mockup from '@/components/IPhone17Mockup';

export default function IPhoneDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">iPhone 17 Mockup</h1>
          <p className="text-gray-600">Widget displayed in iPhone 17 mockup</p>
        </div>
        
        <IPhone17Mockup 
          className="w-full max-w-sm mx-auto"
          widgetSlug="demo-widget"
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This mockup shows how your widget will look on mobile devices
          </p>
        </div>
      </div>
    </div>
  );
}
