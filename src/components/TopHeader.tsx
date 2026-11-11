'use client';

import React from 'react';
import { RideStep, LocationPoint } from '@/types/ride';
import { ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

interface TopHeaderProps {
  step: RideStep;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  onBack: () => void;
  onReset: () => void;
}

export default function TopHeader({
  step,
  origin,
  destination,
  onBack,
  onReset,
}: TopHeaderProps) {
  return (
    <header className="absolute top-4 inset-x-4 z-30 flex flex-col gap-2.5 pointer-events-auto">
      {/* ردیف اول: بالا سمت راست «سفر ایمن» و بالا سمت چپ «هم مسیر» با رنگ سازمانی بدون کادر و بدون لوگو */}
      <div className="flex items-center justify-between">
        {/* بالا سمت راست: سفر ایمن دقیقاً به همان شکل اولیه */}
        {step !== 'SELECT_ORIGIN' ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            aria-label="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-[#3A86FF]/10 flex items-center justify-center text-[#3A86FF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">سفر ایمن</span>
          </div>
        )}

        {/* بالا سمت چپ: اسم برنامه «هم مسیر» با رنگ primary داخل باکس سفید مشابه سفر ایمن */}
        <div className="flex items-center gap-2">
          {step !== 'SELECT_ORIGIN' && (
            <button
              onClick={onReset}
              className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
              title="شروع مجدد"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-100 flex items-center justify-center">
            <span className="text-xs font-bold text-[#3A86FF] tracking-tight select-none">
              هم مسیر
            </span>
          </div>
        </div>
      </div>

      {/* ردیف دوم: کادر مربوط به مبدا/مقصد/انتخاب خودرو که دقیقاً زیر اسم قرار می‌گیرد همراه با white space */}
      <div className="flex justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-100 text-[11px] font-semibold text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              step === 'SELECT_ORIGIN'
                ? 'bg-[#3A86FF] ring-2 ring-[#3A86FF]/30'
                : 'bg-slate-300'
            }`}
          />
          <span>مبدأ</span>
          <span className="text-slate-300">/</span>
          <span
            className={`w-2 h-2 rounded-full ${
              step === 'SELECT_DESTINATION'
                ? 'bg-[#3A86FF] ring-2 ring-[#3A86FF]/30'
                : 'bg-slate-300'
            }`}
          />
          <span>مقصد</span>
          <span className="text-slate-300">/</span>
          <span
            className={`w-2 h-2 rounded-full ${
              step === 'SELECT_RIDE'
                ? 'bg-[#3A86FF] ring-2 ring-[#3A86FF]/30'
                : 'bg-slate-300'
            }`}
          />
          <span>انتخاب خودرو</span>
        </div>
      </div>

      {/* خلاصه مبدأ و مقصد در مرحله انتخاب خودرو */}
      {step === 'SELECT_RIDE' && origin && destination && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-100 text-xs flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A86FF] shrink-0" />
            <span className="text-slate-500 shrink-0">مبدأ:</span>
            <span className="font-semibold text-slate-800 truncate">
              {origin.address}
            </span>
          </div>
          <div className="h-px bg-slate-100 mx-2" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className="text-slate-500 shrink-0">مقصد:</span>
            <span className="font-semibold text-slate-800 truncate">
              {destination.address}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
