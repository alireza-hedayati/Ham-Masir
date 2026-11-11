import { Coordinates, LocationPoint, RideOption, RouteInfo, SearchResult } from '@/types/ride';

/**
 * تبدیل مختصات جغرافیایی به نام آدرس و محله (Reverse Geocoding)
 */
export async function reverseGeocode(coords: Coordinates): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1&accept-language=fa`,
      {
        headers: {
          'User-Agent': 'persian-ride-app/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address;
      if (addr) {
        const road = addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood;
        const city = addr.city || addr.town || addr.county || 'تهران';
        if (road) {
          return `${city}، ${road}`;
        }
      }
      if (data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 2).join('، ');
      }
    }
  } catch {
    // در صورت قطعی اینترنت یا خطا در سرور اوپن‌استریت‌مپ، آدرس تقریب زده می‌شود
  }

  // مقدار پیش‌فرض منظم
  return `موقعیت روی نقشه (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
}

/**
 * دریافت مسیر دقیق رانندگی بین مبدأ و مقصد و مسافت و زمان سفر (OSRM Routing API)
 */
export async function getRoute(origin: Coordinates, destination: Coordinates): Promise<RouteInfo> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMin = Math.max(3, Math.round(route.duration / 60));

        // تبدیل مختصات GeoJSON [lng, lat] به مختصات Leaflet [lat, lng]
        const polyline: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        return { distanceKm, durationMin, polyline };
      }
    }
  } catch {
    // در صورت عدم دسترسی به اینترنت سراسری، مسیر مستقیم شبیه‌سازی می‌شود
  }

  // محاسبه تقریبی مسافت خطی (Haversine Formula) در صورت قطعی وب‌سرویس
  const R = 6371; // شعاع زمین به کیلومتر
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  const estimatedDrivingKm = Number((directDistance * 1.3).toFixed(1)); // ضریب پیچ‌وخم خیابان‌ها
  const estimatedMin = Math.max(4, Math.round(estimatedDrivingKm * 2.5)); // متوسط هر کیلومتر ۲.۵ دقیقه

  return {
    distanceKm: estimatedDrivingKm,
    durationMin: estimatedMin,
    polyline: [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ],
  };
}

/**
 * محاسبه کرایه بر اساس نرخ‌های واقعی تاکسی اینترنتی (پایه + مسافت + زمان ترافیک)
 */
export function calculateRideOptions(distanceKm: number, durationMin: number): RideOption[] {
  const baseFare = 24000; // ورودی پایه ۲۴ هزار تومان
  const perKmRate = 4200; // هر کیلومتر ۴۲۰۰ تومان
  const perMinRate = 1100; // هر دقیقه ترافیک ۱۱۰۰ تومان

  const rawEcoPrice = baseFare + distanceKm * perKmRate + durationMin * perMinRate;
  // رند کردن به مضرب ۱۰۰۰ تومان
  const ecoPrice = Math.round(rawEcoPrice / 1000) * 1000;
  const plusPrice = Math.round((ecoPrice * 1.38) / 1000) * 1000;
  const womenPrice = Math.round((ecoPrice * 1.05) / 1000) * 1000;

  return [
    {
      id: 'eco',
      title: 'سرویس اقتصادی',
      subTitle: 'به‌صرفه‌ترین و سریع‌ترین گزینه',
      price: Math.max(30000, ecoPrice),
      eta: '۳ دقیقه تا سوار شدن',
      tag: 'به‌صرفه',
      iconType: 'standard',
    },
    {
      id: 'plus',
      title: 'تاکسی پلاس (ویژه)',
      subTitle: 'خودروهای مدل بالا با تهویه مطبوع',
      price: Math.max(45000, plusPrice),
      eta: '۵ دقیقه تا سوار شدن',
      tag: 'لوکس',
      iconType: 'plus',
    },
    {
      id: 'women',
      title: 'سرویس بانوان',
      subTitle: 'سفر امن ویژه بانوان محترم',
      price: Math.max(32000, womenPrice),
      eta: '۴ دقیقه تا سوار شدن',
      iconType: 'women',
    },
  ];
}

/**
 * جستجوی آنلاین و آفلاین آدرس و اماکن شاخص با پشتیبانی از زبان فارسی
 */
export async function searchAddress(query: string): Promise<SearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  // لیست اماکن شاخص تهران برای پاسخ آنی و بدون قطعی
  const popularSpots: SearchResult[] = [
    { id: 'spot-1', title: 'میدان آزادی', subtitle: 'منطقه ۹، غرب تهران', lat: 35.6997, lng: 51.338 },
    { id: 'spot-2', title: 'میدان ولیعصر', subtitle: 'منطقه ۶، مرکز تهران', lat: 35.7152, lng: 51.4043 },
    { id: 'spot-3', title: 'میدان ونک', subtitle: 'منطقه ۳، شمال تهران', lat: 35.7575, lng: 51.41 },
    { id: 'spot-4', title: 'میدان تجریش', subtitle: 'منطقه ۱، شمال تهران', lat: 35.8052, lng: 51.4305 },
    { id: 'spot-5', title: 'فرودگاه مهرآباد', subtitle: 'ترمینال ۱ و ۲، غرب تهران', lat: 35.6892, lng: 51.3134 },
    { id: 'spot-6', title: 'صادقیه (آریاشهر)', subtitle: 'فلکه دوم صادقیه، غرب تهران', lat: 35.7201, lng: 51.3327 },
    { id: 'spot-7', title: 'چهارراه ولیعصر و تئاتر شهر', subtitle: 'خیابان انقلاب، مرکز تهران', lat: 35.7005, lng: 51.4055 },
    { id: 'spot-8', title: 'سعادت‌آباد (میدان کاج)', subtitle: 'منطقه ۲، شمال غرب تهران', lat: 35.7828, lng: 51.3732 },
    { id: 'spot-9', title: 'برج میلاد تهران', subtitle: 'بزرگراه همت، غرب تهران', lat: 35.7448, lng: 51.3753 },
    { id: 'spot-10', title: 'تهرانپارس (فلکه اول)', subtitle: 'منطقه ۴، شرق تهران', lat: 35.7272, lng: 51.5284 },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&countrycodes=ir&accept-language=fa&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'persian-ride-app/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any, idx: number) => {
          const parts = item.display_name.split(',');
          const title = parts[0]?.trim() || cleanQuery;
          const subtitle = parts.slice(1, 3).join('، ').trim() || 'تهران، ایران';
          return {
            id: `osm-${item.place_id || idx}`,
            title,
            subtitle,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    }
  } catch {
    // در صورت قطعی اینترنت به نتایج کش شده بازمی‌گردد
  }

  // فیلتر کردن اماکن شاخص در صورت عدم دریافت نتیجه آنلاین
  return popularSpots.filter(
    (s) => s.title.includes(cleanQuery) || s.subtitle.includes(cleanQuery)
  );
}
