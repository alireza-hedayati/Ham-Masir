export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPoint extends Coordinates {
  address: string;
}

export type RideStep =
  | 'SELECT_ORIGIN'
  | 'SELECT_DESTINATION'
  | 'SELECT_RIDE'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_FOUND';

export interface RideOption {
  id: string;
  title: string;
  subTitle: string;
  price: number;
  eta: string;
  tag?: string;
  iconType: 'standard' | 'plus' | 'women';
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  polyline: [number, number][];
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
}
