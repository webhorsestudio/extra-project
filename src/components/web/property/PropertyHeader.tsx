import React from 'react';
import { Heart, Send } from 'lucide-react';

export default function PropertyHeader() {
  // Hardcoded data for now
  const badge = 'Newly Launched';
  const logo = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Godrej_Logo.svg';
  const title = 'Godrej Avenue 11';
  const subtitle = 'Mahalaxmi';

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded shadow">{badge}</span>
          <img src={logo} alt="Logo" className="h-8 w-auto bg-white rounded shadow p-1" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
        <div className="text-gray-500 text-base mt-1">{subtitle}</div>
      </div>
      {/* Actions */}
      <div className="flex gap-2">
        <button className="bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200">
          <Send className="h-5 w-5 text-gray-700" />
        </button>
        <button className="bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200">
          <Heart className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
} 