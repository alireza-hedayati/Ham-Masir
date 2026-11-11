'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Coordinates,
  LocationPoint,
  RideStep,
  RideOption,
  RouteInfo,
} from '@/types/ride';
import {
  reverseGeocode,
  getRoute,
  calculateRideOptions,
} from '@/services/routing';
import CenterPin from '@/components/CenterPin';
import TopHeader from '@/components/TopHeader';
import BottomSheet from '@/components/BottomSheet';

// بارگذاری داینامیک نقشه برای جلوگیری از رندر سمت سرور (Next.js SSR Fix)
const RideMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
      <div className="flex flex-col items-center gap-2">
        <span className="w-6 h-6 border-2 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
        <span>در حال بارگذاری نقشه...</span>
      </div>
    </div>
  ),
});

export default function RideBookingPage() {
  const [step, setStep] = useState<RideStep>('SELECT_ORIGIN');
  const [currentCenter, setCurrentCenter] = useState<Coordinates>({
    lat: 35.7152,
    lng: 51.4043,
  });
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [origin, setOrigin] = useState<LocationPoint | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<string>('eco');
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [flyToTarget, setFlyToTarget] = useState<Coordinates | null>(null);

  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // دریافت آدرس متنی از مختصات مرکز نقشه با Debounce
  const updateAddressForCoords = useCallback((coords: Coordinates) => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    geocodeTimeoutRef.current = setTimeout(async () => {
      const addr = await reverseGeocode(coords);
      setCurrentAddress(addr);
    }, 400);
  }, []);

  const handleCenterChange = (coords: Coordinates) => {
    setCurrentCenter(coords);
  };

  const handleMapDragStart = () => {
    setIsDragging(true);
  };

  const handleMapDragEnd = () => {
    setIsDragging(false);
    updateAddressForCoords(currentCenter);
  };

  useEffect(() => {
    updateAddressForCoords(currentCenter);
  }, [currentCenter, updateAddressForCoords]);

  // ۱. تأیید مبدأ
  const handleConfirmOrigin = () => {
    const originPoint: LocationPoint = {
      lat: currentCenter.lat,
      lng: currentCenter.lng,
      address: currentAddress || 'مبدأ انتخاب شده',
    };
    setOrigin(originPoint);
    setStep('SELECT_DESTINATION');
  };

  // ۲. تأیید مقصد و شروع محاسبه مسیر و کرایه
  const handleConfirmDestination = async () => {
    if (!origin) return;

    const destPoint: LocationPoint = {
      lat: currentCenter.lat,
      lng: currentCenter.lng,
      address: currentAddress || 'مقصد انتخاب شده',
    };
    setDestination(destPoint);
    setIsLoadingRoute(true);

    // محاسبه آنلاین مسیر از طریق OSRM و تعیین کرایه
    const route = await getRoute(origin, destPoint);
    setRouteInfo(route);

    const calculatedOptions = calculateRideOptions(
      route.distanceKm,
      route.durationMin
    );
    setRideOptions(calculatedOptions);
    setSelectedRideId(calculatedOptions[0].id);

    setIsLoadingRoute(false);
    setStep('SELECT_RIDE');
  };

  // ۳. بازگشت به مرحله قبلی
  const handleBack = () => {
    if (step === 'SELECT_DESTINATION') {
      setStep('SELECT_ORIGIN');
    } else if (step === 'SELECT_RIDE') {
      setStep('SELECT_DESTINATION');
      setRouteInfo(null);
    } else if (step === 'SEARCHING_DRIVER') {
      setStep('SELECT_RIDE');
    }
  };

  // ۴. شروع مجدد
  const handleReset = () => {
    setStep('SELECT_ORIGIN');
    setOrigin(null);
    setDestination(null);
    setRouteInfo(null);
    setRideOptions([]);
  };

  // ۵. درخواست نهایی سفر و شبیه‌سازی پیدا شدن راننده
  const handleRequestRide = () => {
    setStep('SEARCHING_DRIVER');
    // شبیه‌سازی پیدا شدن راننده پس از ۳ ثانیه
    setTimeout(() => {
      setStep('DRIVER_FOUND');
    }, 3200);
  };

  const handleCancelSearch = () => {
    setStep('SELECT_RIDE');
  };

  // ۶. انتخاب آدرس از طریق جستجو و تایپ دستی
  const handleSelectLocation = (lat: number, lng: number, addressText: string) => {
    setCurrentCenter({ lat, lng });
    setCurrentAddress(addressText);
    setFlyToTarget({ lat, lng });
  };

  return (
    <main className="w-full min-h-screen bg-slate-900 md:py-6 flex items-center justify-center font-sans antialiased overflow-hidden">
      {/* قاب موبایل وب (طراحی واکنش‌گرا: تمام صفحه در موبایل، فریم شیک در دسکتاپ) */}
      <div className="relative w-full h-[100dvh] md:max-w-md md:h-[840px] bg-white md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-slate-800 overflow-hidden flex flex-col">
        {/* هدر بالا */}
        <TopHeader
          step={step}
          origin={origin}
          destination={destination}
          onBack={handleBack}
          onReset={handleReset}
        />

        {/* نقشه تمام‌صفحه */}
        <div className="relative flex-1 w-full h-full">
          <RideMap
            step={step}
            origin={origin}
            destination={destination}
            routePolyline={routeInfo ? routeInfo.polyline : []}
            flyToTarget={flyToTarget}
            onCenterChange={handleCenterChange}
            onMapDragStart={handleMapDragStart}
            onMapDragEnd={handleMapDragEnd}
          />

          {/* پین متحرک وسط صفحه */}
          <CenterPin
            step={step}
            isDragging={isDragging}
            address={currentAddress}
          />
        </div>

        {/* باتم شیت پایین صفحه */}
        <BottomSheet
          step={step}
          address={currentAddress}
          routeInfo={routeInfo}
          rideOptions={rideOptions}
          selectedRideId={selectedRideId}
          onSelectRide={setSelectedRideId}
          onConfirmOrigin={handleConfirmOrigin}
          onConfirmDestination={handleConfirmDestination}
          onSelectLocation={handleSelectLocation}
          onRequestRide={handleRequestRide}
          onCancelSearch={handleCancelSearch}
          onReset={handleReset}
          isLoadingRoute={isLoadingRoute}
        />
      </div>
    </main>
  );
}
