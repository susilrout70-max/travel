import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default leaflet marker icon issue in Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin icon generator
export const createCustomIcon = (color: string = '#0d9488') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  price?: number;
  color?: string;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: MarkerItem[];
  className?: string;
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const InteractiveMap: React.FC<MapProps> = ({
  center,
  zoom = 12,
  markers = [],
  className = 'h-[360px]',
}) => {
  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-glass border border-slate-200 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} zoom={zoom} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.color || '#0d9488')}
          >
            <Popup className="travelhub-popup">
              <div className="p-1 text-slate-800">
                <h4 className="font-bold text-sm text-slate-900">{marker.title}</h4>
                {marker.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{marker.subtitle}</p>
                )}
                {marker.price && (
                  <p className="text-xs font-bold text-brand-600 mt-1">
                    ₹{marker.price.toLocaleString('en-IN')}{' '}
                    <span className="font-normal text-slate-400">/ night</span>
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
