'use client';

import { IPhone17Mockup } from '@/components/IPhone17Mockup';

export default function MockupDemoPage() {
  return (
    <IPhone17Mockup>
      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Filters */}
          <div className="max-w-3xl mx-auto mb-1">
            <div className="flex items-center justify-center space-x-3">
              {/* Refresh Button */}
              <div className="btn-wrapper">
                <button className="btn">
                  <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    ></path>
                  </svg>

                  <div className="txt-wrapper">
                    <div className="txt-1">
                      <span className="btn-letter">R</span>
                      <span className="btn-letter">e</span>
                      <span className="btn-letter">f</span>
                      <span className="btn-letter">r</span>
                      <span className="btn-letter">e</span>
                      <span className="btn-letter">s</span>
                      <span className="btn-letter">h</span>
                    </div>
                    <div className="txt-2">
                      <span className="btn-letter">R</span>
                      <span className="btn-letter">e</span>
                      <span className="btn-letter">f</span>
                      <span className="btn-letter">r</span>
                      <span className="btn-letter">e</span>
                      <span className="btn-letter">s</span>
                      <span className="btn-letter">h</span>
                      <span className="btn-letter">i</span>
                      <span className="btn-letter">n</span>
                      <span className="btn-letter">g</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Filter Toggle Button */}
              <div className="btn-wrapper">
                <button className="btn-icon">
                  <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* View Toggle Icons */}
          <div className="max-w-6xl mx-auto mb-1 flex justify-between items-center px-4">
            {/* Grid Icon */}
            <div className="flex-1 flex justify-end">
              <button className="p-2 transition-all flex items-center justify-center mr-5 text-black shadow-[0_2px_0_0_rgba(0,0,0,1)] scale-x-130">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="5" height="5"/>
                  <rect x="9.5" y="2" width="5" height="5"/>
                  <rect x="17" y="2" width="5" height="5"/>
                  <rect x="2" y="9.5" width="5" height="5"/>
                  <rect x="9.5" y="9.5" width="5" height="5"/>
                  <rect x="17" y="9.5" width="5" height="5"/>
                  <rect x="2" y="17" width="5" height="5"/>
                  <rect x="9.5" y="17" width="5" height="5"/>
                  <rect x="17" y="17" width="5" height="5"/>
                </svg>
              </button>
            </div>

            {/* Reels Icon */}
            <div className="flex-1 flex justify-center">
              <button className="p-2 transition-all flex items-center justify-center text-black hover:text-gray-600">
                <svg className="w-6 h-6" viewBox="0 0 50 50" fill="currentColor">
                  <path d="M13.34 4.13L20.26 16H4v-1C4 9.48 8.05 4.92 13.34 4.13zM33.26 16L22.57 16 15.57 4 26.26 4zM46 15v1H35.57l-7-12H35C41.08 4 46 8.92 46 15zM4 18v17c0 6.08 4.92 11 11 11h20c6.08 0 11-4.92 11-11V18H4zM31 32.19l-7.99 4.54C21.68 37.49 20 36.55 20 35.04v-9.08c0-1.51 1.68-2.45 3.01-1.69L31 28.81C32.33 29.56 32.33 31.44 31 32.19z"></path>
                </svg>
              </button>
            </div>

            <div className="flex-1"></div>
          </div>

          {/* Sample Content Grid */}
          <div className="grid grid-cols-3 gap-1 max-w-3xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Card {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IPhone17Mockup>
  );
}
