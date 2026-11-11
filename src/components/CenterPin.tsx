'use client';

import { RideStep } from '@/types/ride';
import { MapPin } from 'lucide-react';

interface CenterPinProps {
  step: RideStep;
  isDragging: boolean;
  address: string;
}

export default function CenterPin({ step, isDragging, address }: CenterPinProps) {
  // پین فقط در مراحل انتخاب مبدأ و مقصد نمایش داده می‌شود
  if (step !== 'SELECT_ORIGIN' && step !== 'SELECT_DESTINATION') {
    return null;
  }

  const isOrigin = step === 'SELECT_ORIGIN';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center transition-transform duration-200">
      {/* برچسب آدرس و راهنمای بالای پین */}
      <div
        className={`mb-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-slate-100 flex items-center gap-2 max-w-[260px] transition-all duration-200 ${
          isDragging ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isOrigin ? 'bg-[#3A86FF] animate-pulse' : 'bg-red-500 animate-pulse'
          }`}
        />
        <p className="text-xs font-semibold text-slate-800 truncate leading-relaxed">
          {address || (isOrigin ? 'انتخاب مبدأ سفر' : 'انتخاب مقصد سفر')}
        </p>
      </div>

      {/* المان پین نقشه با انیمیشن بلند شدن در هنگام حرکت */}
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ${
          isDragging ? '-translate-y-2.5 scale-110' : 'translate-y-0 scale-100'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-white text-white ${
            isOrigin ? 'bg-[#3A86FF]' : 'bg-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5" />
        </div>
        {/* دم پین */}
        <div
          className={`w-0.5 h-3 ${
            isOrigin ? 'bg-[#3A86FF]' : 'bg-slate-900'
          }`}
        />
      </div>

      {/* سایه روی زمین زیر پین */}
      <div
        className={`w-4 h-1.5 bg-black/25 rounded-full blur-[1px] transition-all duration-200 ${
          isDragging ? 'scale-75 opacity-40' : 'scale-100 opacity-80'
        }`}
      />
    </div>
  );
}
