// components/EventPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minimize2 } from 'lucide-react';

export default function EventPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('event-popup-seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isClosing) handleClose();
    };
    if (isOpen && !isMinimized) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMinimized]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      sessionStorage.setItem('event-popup-seen', 'true');
      setIsOpen(false);
      setIsMinimized(false);
      setIsClosing(false);
    }, 600);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  if (!isOpen) return null;

  // Minimized floating bubble
  if (isMinimized) {
    return createPortal(
      <div
        onClick={handleRestore}
        className={`
          fixed bottom-6 right-6 z-50 w-16 h-16 
          bg-gradient-to-br from-indigo-400 to-blue-500 
          rounded-full shadow-2xl shadow-indigo-500/40 
          flex items-center justify-center cursor-pointer
          animate-bounce-slow hover:scale-110 transition-transform duration-300
        `}
      >
        <span className="text-white text-3xl">🎉</span>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
          !
        </div>
      </div>,
      document.body
    );
  }

  // Full popup
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-700 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Main popup container */}
      <div
        className={`
          fixed top-[8%] sm:top-[10%] right-[4%] sm:right-[5%] z-50 
          max-w-xs sm:max-w-sm w-[92%] sm:w-full
          origin-top-right
          transition-all duration-700 ease-out
          ${isClosing
            ? 'opacity-0 scale-50 -translate-x-40 -translate-y-20 rotate-6'
            : 'opacity-100 scale-100 translate-x-0 translate-y-0 rotate-0'
          }
          animate-float-slow
        `}
      >
        <div className="relative">
          {/* Blob content */}
          <div
            className={`
              bg-gradient-to-br from-indigo-100/90 via-white/90 to-blue-100/90 
              border border-indigo-200/60 
              rounded-[42%_58%_64%_36%_/_48%_32%_68%_52%] 
              shadow-2xl shadow-indigo-400/30 overflow-hidden backdrop-blur-lg
              transition-transform duration-300 hover:scale-[1.02]
            `}
            style={{
              borderRadius: '42% 58% 64% 36% / 48% 32% 68% 52%',
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-20 h-12 bg-blue-200/40 rounded-full blur-md opacity-70" />

            {/* Content */}
            <div className="p-8 pb-12 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl animate-pulse-slow">
                <span className="text-white text-4xl drop-shadow-md">🎉</span>
              </div>

              <h2 className="text-3xl font-extrabold text-indigo-900 mb-4 tracking-tight">
                Big Event Alert! 🚀
              </h2>

              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Our <strong>Entrepreneurship Training</strong> is coming <br />
                <span className="font-bold text-indigo-700">March 15, 2026</span>!<br />
                Early bird tickets → <strong className="text-rose-600">30% OFF</strong> (48 hours only!)
              </p>

              <a
                href="/futurentrpreneurship26"
                className={`
                  inline-block bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 
                  text-white px-10 py-5 rounded-full font-bold text-lg
                  shadow-2xl shadow-indigo-500/40 
                  hover:shadow-2xl hover:shadow-indigo-600/50 
                  hover:from-indigo-700 hover:to-blue-700 
                  transition-all duration-300 transform hover:-translate-y-2 active:scale-95
                `}
              >
                Grab My Spot →
              </a>
            </div>
          </div>

          {/* Control buttons – positioned outside to avoid clipping */}
          <div className="absolute -top-5 right-4 sm:right-6 flex gap-3 z-20">
            <button
              onClick={handleMinimize}
              className="
                bg-white/90 backdrop-blur-md text-gray-700 
                p-2.5 rounded-full shadow-md hover:shadow-lg 
                hover:text-indigo-700 hover:bg-indigo-50/90 
                transition-all duration-200 transform hover:scale-110
              "
              aria-label="Minimize popup"
            >
              <Minimize2 size={22} strokeWidth={2.5} />
            </button>

            <button
              onClick={handleClose}
              className="
                bg-white/90 backdrop-blur-md text-gray-700 
                p-2.5 rounded-full shadow-md hover:shadow-lg 
                hover:text-rose-600 hover:bg-rose-50/90 
                transition-all duration-200 transform hover:scale-110
              "
              aria-label="Close popup"
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}