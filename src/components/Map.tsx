'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates, LocationPoint, RideStep } from '@/types/ride';
import { LocateFixed, Loader2 } from 'lucide-react';

interface MapProps {
  step: RideStep;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  routePolyline: [number, number][];
  flyToTarget?: Coordinates | null;
  onCenterChange: (coords: Coordinates) => void;
  onMapDragStart: () => void;
  onMapDragEnd: () => void;
}

export default function RideMap({
  step,
  origin,
  destination,
  routePolyline,
  flyToTarget,
  onCenterChange,
  onMapDragStart,
  onMapDragEnd,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // هدایت خودکار نقشه به موقعیت مکانی زنده کاربر (GPS Geolocation)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('مرورگر شما از قابلیت موقعیت مکانی پشتیبانی نمی‌کند.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.2,
          });
          onCenterChange({ lat: latitude, lng: longitude });
          setTimeout(() => {
            onMapDragEnd();
          }, 1250);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'امکان دریافت موقعیت مکانی وجود ندارد.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            'دسترسی به موقعیت مکانی در مرورگر مسدود شده است. لطفاً آن را فعال کنید.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'سیگنال موقعیت مکانی در دسترس نیست.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'زمان درخواست موقعیت به پایان رسید.';
        }
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ۱. راه‌اندازی اولیه نقشه
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // موقعیت پیش‌فرض: تهران (میدان ولیعصر)
    const defaultCenter: [number, number] = [35.7152, 51.4043];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false, // کنترل زوم پیش‌فرض حذف شد برای طراحی مینیمال
      attributionControl: false,
    });

    // لایه رسمی و رایگان OpenStreetMap بدون نیاز به هیچ کلید یا API Key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // رویدادهای جابه‌جایی نقشه
    map.on('movestart', () => {
      onMapDragStart();
    });

    map.on('move', () => {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
      onMapDragEnd();
    });

    // اطلاع‌رسانی مختصات اولیه
    onCenterChange({ lat: defaultCenter[0], lng: defaultCenter[1] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ۲. هدایت نقشه به مختصات جستجو شده (FlyTo)
  useEffect(() => {
    if (!flyToTarget) return;
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [flyToTarget]);

  // ۳. به‌روزرسانی مارکرها و مسیر نقشه با تغییر وضعیت
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // آیکون مبدأ (دایره آبی تمیز با کادر سفید)
    const originIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#3A86FF; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; box-shadow:0 2px 8px rgba(58,134,255,0.4); margin-bottom:4px; white-space:nowrap;">
            مبدأ
          </div>
          <div style="width:18px; height:18px; background:#3A86FF; border:3px solid #ffffff; border-radius:50%; box-shadow:0 2px 10px rgba(0,0,0,0.25);"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
    });

    // آیکون مقصد (پین شاخص مشکی/قرمز با کادر سفید)
    const destinationIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#1E293B; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.2); margin-bottom:4px; white-space:nowrap;">
            مقصد
          </div>
          <div style="width:18px; height:18px; background:#EF4444; border:3px solid #ffffff; border-radius:50%; box-shadow:0 2px 10px rgba(239,68,68,0.4);"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
    });

    if (origin && step !== 'SELECT_ORIGIN') {
      L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(markersGroup);
    }

    if (destination && step !== 'SELECT_DESTINATION') {
      L.marker([destination.lat, destination.lng], { icon: destinationIcon }).addTo(
        markersGroup
      );
    }

    // ترسیم خط مسیر (Polyline) با رنگ شاخص #3A86FF
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routePolyline.length > 0 && (step === 'SELECT_RIDE' || step === 'SEARCHING_DRIVER')) {
      const polyline = L.polyline(routePolyline, {
        color: '#3A86FF',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLayerRef.current = polyline;

      // تنظیم خودکار دید نقشه روی تمام مسیر با در نظر گرفتن باتم‌شیت پایین صفحه
      map.fitBounds(polyline.getBounds(), {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [50, 260],
        animate: true,
      });
    }
  }, [origin, destination, routePolyline, step]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* دکمه شناور موقعیت مکانی من (GPS Floating Action Button) */}
      {(step === 'SELECT_ORIGIN' || step === 'SELECT_DESTINATION') && (
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="موقعیت فعلی من"
          aria-label="موقعیت فعلی من"
          className="absolute left-5 bottom-[265px] z-20 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-100 flex items-center justify-center text-slate-700 hover:text-[#3A86FF] hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-70 group cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-[#3A86FF] animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5 transition-transform group-hover:scale-110" />
          )}
        </button>
      )}
    </div>
  );
}
