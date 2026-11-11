'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RideStep, RideOption, RouteInfo, SearchResult } from '@/types/ride';
import { searchAddress } from '@/services/routing';
import {
  Car,
  Sparkles,
  HeartHandshake,
  CreditCard,
  Tag,
  Navigation,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Search,
  X,
  MapPin,
  Loader2,
} from 'lucide-react';

interface BottomSheetProps {
  step: RideStep;
  address: string;
  routeInfo: RouteInfo | null;
  rideOptions: RideOption[];
  selectedRideId: string;
  onSelectRide: (id: string) => void;
  onConfirmOrigin: () => void;
  onConfirmDestination: () => void;
  onSelectLocation: (lat: number, lng: number, address: string) => void;
  onRequestRide: () => void;
  onCancelSearch: () => void;
  onReset: () => void;
  isLoadingRoute: boolean;
}

export default function BottomSheet({
  step,
  address,
  routeInfo,
  rideOptions,
  selectedRideId,
  onSelectRide,
  onConfirmOrigin,
  onConfirmDestination,
  onSelectLocation,
  onRequestRide,
  onCancelSearch,
  onReset,
  isLoadingRoute,
}: BottomSheetProps) {
  const selectedOption =
    rideOptions.find((r) => r.id === selectedRideId) || rideOptions[0];

  const [searchInput, setSearchInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // همگام‌سازی آدرس نقشه با فیلد در صورت عدم تایپ فعال
  useEffect(() => {
    if (!isTyping) {
      setSearchInput(address);
    }
  }, [address, isTyping]);

  // بازنشانی وضعیت سرچ با تغییر مرحله
  useEffect(() => {
    setIsTyping(false);
    setShowDropdown(false);
    setResults([]);
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    setIsTyping(true);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        const res = await searchAddress(val);
        setResults(res);
        setIsSearching(false);
      }, 250);
    } else {
      setShowDropdown(false);
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setIsTyping(true);
    setResults([]);
    setShowDropdown(false);
  };

  const handleSelect = (item: SearchResult) => {
    setSearchInput(item.title);
    setIsTyping(false);
    setShowDropdown(false);
    onSelectLocation(item.lat, item.lng, `${item.title}، ${item.subtitle}`);
  };

  const popularChips = [
    'میدان آزادی',
    'میدان ونک',
    'میدان تجریش',
    'فرودگاه مهرآباد',
    'برج میلاد',
  ];

  return (
    <section className="absolute bottom-0 inset-x-0 z-30 pointer-events-auto bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100 px-5 pt-3 pb-6 max-h-[85vh] flex flex-col transition-all duration-300">
      {/* دستگیره بالای شیت (Drag Handle) */}
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

      {/* ۱. مرحله انتخاب مبدأ */}
      {step === 'SELECT_ORIGIN' && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#3A86FF] uppercase tracking-wider">
                گام اول
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-0.5">
                مبدأ سفر را مشخص کنید
              </h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#3A86FF]/10 text-[#3A86FF] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          {/* فیلد ورودی دستی آدرس با قابلیت جستجو */}
          <div className="relative flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <div className="absolute right-3.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchInput.trim().length >= 2 && results.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="تایپ یا جستجوی آدرس مبدأ (مثلاً آزادی)..."
                className="w-full pr-10 pl-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:ring-2 focus:ring-[#3A86FF]/30 focus:border-[#3A86FF] rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 transition-all outline-none"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute left-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  title="پاک کردن"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* دراپ‌داون نتایج جستجو رو به بالا */}
            {showDropdown && (
              <div className="absolute bottom-full mb-2 inset-x-0 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-2.5 text-[10px] font-bold text-slate-400 flex items-center justify-between bg-slate-50/70">
                  <span>نتایج اماکن پیدا شده</span>
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3A86FF]" />
                  )}
                </div>
                {results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-2.5 hover:bg-[#3A86FF]/5 cursor-pointer flex items-center gap-2.5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#3A86FF]/10 text-[#3A86FF] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))
                ) : !isSearching ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    مکانی با این نام یافت نشد.
                  </div>
                ) : null}
              </div>
            )}

            {/* چیپ‌های اماکن پرطرفدار */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              <span className="text-[10px] text-slate-400 shrink-0">پیشنهاد:</span>
              {popularChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchInput(chip);
                    setIsTyping(true);
                    searchAddress(chip).then((res) => {
                      if (res.length > 0) handleSelect(res[0]);
                    });
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#3A86FF]/10 hover:text-[#3A86FF] active:scale-95 text-slate-600 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onConfirmOrigin}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#3A86FF] hover:bg-[#2563EB] active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-[#3A86FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            تأیید مبدأ
          </button>
        </div>
      )}

      {/* ۲. مرحله انتخاب مقصد */}
      {step === 'SELECT_DESTINATION' && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                گام دوم
              </span>
              <h2 className="text-base font-bold text-slate-800 mt-0.5">
                مقصد سفر را مشخص کنید
              </h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <Navigation className="w-4 h-4 rotate-180" />
            </div>
          </div>

          {/* فیلد ورودی دستی آدرس مقصد با قابلیت جستجو */}
          <div className="relative flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <div className="absolute right-3.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchInput.trim().length >= 2 && results.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="تایپ یا جستجوی آدرس مقصد (مثلاً تجریش)..."
                className="w-full pr-10 pl-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white focus:ring-2 focus:ring-red-500/30 focus:border-red-500 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 transition-all outline-none"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute left-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  title="پاک کردن"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* دراپ‌داون نتایج جستجو رو به بالا */}
            {showDropdown && (
              <div className="absolute bottom-full mb-2 inset-x-0 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-2.5 text-[10px] font-bold text-slate-400 flex items-center justify-between bg-slate-50/70">
                  <span>نتایج اماکن پیدا شده</span>
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                  )}
                </div>
                {results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-2.5 hover:bg-red-50/60 cursor-pointer flex items-center gap-2.5 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))
                ) : !isSearching ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    مکانی با این نام یافت نشد.
                  </div>
                ) : null}
              </div>
            )}

            {/* چیپ‌های اماکن پرطرفدار برای مقصد */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              <span className="text-[10px] text-slate-400 shrink-0">پیشنهاد:</span>
              {popularChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchInput(chip);
                    setIsTyping(true);
                    searchAddress(chip).then((res) => {
                      if (res.length > 0) handleSelect(res[0]);
                    });
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-500 active:scale-95 text-slate-600 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onConfirmDestination}
            disabled={isLoadingRoute}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#3A86FF] hover:bg-[#2563EB] active:scale-[0.99] disabled:opacity-75 text-white font-bold text-sm shadow-lg shadow-[#3A86FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoadingRoute ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                محاسبه مسیر و کرایه...
              </span>
            ) : (
              'تأیید مقصد و محاسبه کرایه'
            )}
          </button>
        </div>
      )}

      {/* ۳. مرحله انتخاب نوع سرویس و قیمت */}
      {step === 'SELECT_RIDE' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-300">
          {/* نوار اطلاعات سفر: مسافت و زمان */}
          {routeInfo && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
              <span>
                مسافت:{' '}
                <strong className="text-slate-900">
                  {routeInfo.distanceKm}
                </strong>{' '}
                کیلومتر
              </span>
              <span className="text-slate-300">•</span>
              <span>
                زمان تخمینی:{' '}
                <strong className="text-slate-900">
                  {routeInfo.durationMin}
                </strong>{' '}
                دقیقه
              </span>
            </div>
          )}

          {/* لیست سرویس‌های خودرو */}
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-0.5">
            {rideOptions.map((option) => {
              const isSelected = option.id === selectedRideId;
              return (
                <div
                  key={option.id}
                  onClick={() => onSelectRide(option.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#3A86FF] bg-[#3A86FF]/5 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#3A86FF] text-white shadow-md shadow-[#3A86FF]/30'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {option.iconType === 'plus' ? (
                        <Sparkles className="w-5 h-5" />
                      ) : option.iconType === 'women' ? (
                        <HeartHandshake className="w-5 h-5" />
                      ) : (
                        <Car className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {option.title}
                        </span>
                        {option.tag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3A86FF]/10 text-[#3A86FF]">
                            {option.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {option.eta}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-extrabold text-slate-900">
                      {option.price.toLocaleString('fa-IR')}
                      <span className="text-[10px] font-normal text-slate-500 mr-1">
                        تومان
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* روش پرداخت و کد تخفیف */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
              <CreditCard className="w-4 h-4 text-[#3A86FF]" />
              <span>پرداخت آنلاین / نقدی</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer text-[#3A86FF] hover:underline">
              <Tag className="w-4 h-4" />
              <span>ثبت کد تخفیف</span>
            </div>
          </div>

          {/* دکمه نهایی ثبت سفر با رنگ سازمانی #3A86FF */}
          <button
            onClick={onRequestRide}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#3A86FF] hover:bg-[#2563EB] active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-[#3A86FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            درخواست {selectedOption?.title} (
            {selectedOption?.price.toLocaleString('fa-IR')} تومان)
          </button>
        </div>
      )}

      {/* ۴. مرحله جستجوی راننده (Radar Animation) */}
      {step === 'SEARCHING_DRIVER' && (
        <div className="flex flex-col items-center py-4 gap-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-20 h-20 rounded-full bg-[#3A86FF]/20 animate-ping" />
            <span className="absolute w-14 h-14 rounded-full bg-[#3A86FF]/40 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-[#3A86FF] text-white flex items-center justify-center shadow-lg shadow-[#3A86FF]/40 relative z-10">
              <Car className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-800">
              در حال جستجوی نزدیک‌ترین راننده...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              راننده‌های اطرافتان در حال بررسی درخواست هستند
            </p>
          </div>

          <button
            onClick={onCancelSearch}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            لغو درخواست
          </button>
        </div>
      )}

      {/* ۵. مرحله پیدا شدن راننده و انجام سفر */}
      {step === 'DRIVER_FOUND' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800">
                راننده پیدا شد و در راه است (۲ دقیقه)
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              ایران ۱۱ - ۷۸۹ س ۱۲
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 font-bold text-sm">
                م.ک
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">محسن کاظمی</h4>
                <p className="text-[11px] text-slate-500">
                  پژو ۲۰۶ سفید • امتیاز ۴.۹ ★
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#3A86FF] cursor-pointer">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-[#3A86FF] shadow-sm flex items-center justify-center text-white hover:bg-[#2563EB] cursor-pointer">
                <PhoneCall className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all cursor-pointer"
          >
            پایان سفر و بازگشت به صفحه اول
          </button>
        </div>
      )}
    </section>
  );
}
