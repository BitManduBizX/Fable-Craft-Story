import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Check } from 'lucide-react';

interface ParentalConsentModalProps {
  onAccept: () => void;
}

const CONSENT_KEY = 'fablecraft_parental_consent_v1';

export const ParentalConsentModal: React.FC<ParentalConsentModalProps> = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const agreed = localStorage.getItem(CONSENT_KEY);
      if (!agreed) {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(false);
    }
  }, []);

  const handleAgree = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    setIsOpen(false);
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="max-w-md w-full bg-[#FFFDF5] text-[#1D3557] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-900/15 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8 text-[#2A9D8F]" />
        </div>

        <h3 className="font-serif-title text-xl font-bold text-[#1D3557]">
          Welcome to FableCraft
        </h3>

        <p className="text-xs text-stone-600 leading-relaxed text-left">
          FableCraft is dedicated to safe, joyful, and timeless story experiences for children, parents, and educators.
        </p>

        <ul className="text-xs text-stone-600 space-y-2 text-left bg-white p-3.5 rounded-2xl border border-stone-200">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Strictly child-safe, age-appropriate AI story responses.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>No commercial ads, trackers, or hidden profiling.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Audio speech runs privately right inside your browser.</span>
          </li>
        </ul>

        <div className="pt-2">
          <button
            onClick={handleAgree}
            className="w-full py-3 rounded-2xl bg-[#E63946] hover:bg-[#d02c39] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            I Agree & Enter Story Treasury
          </button>
        </div>

        <p className="text-[11px] text-stone-400">
          By continuing, you agree to our family-friendly reading & privacy guidelines.
        </p>
      </div>
    </div>
  );
};
