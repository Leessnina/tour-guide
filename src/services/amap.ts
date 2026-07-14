// AMap (高德地图) JS API 2.0 helper
// Load the script dynamically: <script src="https://webapi.amap.com/v2/maps?v=2.0&key=YOUR_KEY&plugin=AMap.Geocoder"></script>

function getAmapKey(): string | null {
  return localStorage.getItem('amap_api_key');
}

export function setAmapKey(key: string): void {
  localStorage.setItem('amap_api_key', key);
}

export function hasAmapKey(): boolean {
  return !!getAmapKey();
}

let amapLoaded = false;
let amapLoadPromise: Promise<void> | null = null;

export function loadAmapScript(): Promise<void> {
  if (amapLoaded) return Promise.resolve();
  if (amapLoadPromise) return amapLoadPromise;

  const key = getAmapKey();
  if (!key) {
    return Promise.reject(new Error('请先设置高德地图 API Key'));
  }

  // Check if already loaded by another instance
  if (window.AMap) {
    amapLoaded = true;
    return Promise.resolve();
  }

  amapLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/v2/maps?v=2.0&key=${key}&plugin=AMap.Geocoder`;
    script.onload = () => {
      amapLoaded = true;
      resolve();
    };
    script.onerror = () => {
      amapLoadPromise = null;
      reject(new Error('高德地图加载失败'));
    };
    document.head.appendChild(script);
  });

  return amapLoadPromise;
}

export interface GeoResult {
  lng: number;
  lat: number;
  formattedAddress: string;
}

export function geocodeAddress(address: string): Promise<GeoResult | null> {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('高德地图未加载'));
      return;
    }

    window.AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getLocation(address, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          const geocode = result.geocodes[0];
          resolve({
            lng: geocode.location.getLng(),
            lat: geocode.location.getLat(),
            formattedAddress: geocode.formattedAddress,
          });
        } else {
          resolve(null);
        }
      });
    });
  });
}

// Extend Window type for AMap
declare global {
  interface Window {
    AMap: any;
  }
}

export function createMap(containerId: string, center?: [number, number]) {
  if (!window.AMap) throw new Error('高德地图未加载');
  return new window.AMap.Map(containerId, {
    zoom: 12,
    center: center || [113.55, 22.23], // default: Zhuhai area
    viewMode: '2D',
  });
}
