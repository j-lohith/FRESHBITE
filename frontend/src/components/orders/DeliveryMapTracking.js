import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const riderSvg = encodeSvg(`
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffb266"/>
        <stop offset="100%" stop-color="#ff7a00"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="64" r="24" fill="url(#g)" opacity="0.2"/>
    <rect x="36" y="40" width="48" height="26" rx="10" fill="#1a2e5c"/>
    <path d="M44 66l10-22h12l8 22" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="44" cy="86" r="12" fill="none" stroke="#1a2e5c" stroke-width="5"/>
    <circle cx="88" cy="86" r="12" fill="none" stroke="#1a2e5c" stroke-width="5"/>
    <path d="M44 86h44" stroke="#ff7a00" stroke-width="6" stroke-linecap="round"/>
  </svg>
`);

const FitBounds = ({ path }) => {
  const map = useMap();
  useEffect(() => {
    if (path?.length && map) {
      const bounds = L.latLngBounds(path.map((point) => [point.lat, point.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, path]);
  return null;
};

const createPin = (label) =>
  L.divIcon({
    className: 'delivery-pin',
    html: `<div class="delivery-pin__bubble delivery-pin__bubble--${label.toLowerCase()}">${label}</div>`,
    iconSize: [90, 36],
    iconAnchor: [45, 32],
  });

const riderIcon = L.divIcon({
  className: 'delivery-rider',
  html: `<div class="delivery-rider__bubble"><img src="${riderSvg}" alt="Delivery rider" /></div>`,
  iconSize: [70, 70],
  iconAnchor: [35, 35],
});

const DeliveryMapTracking = ({ route }) => {
  const [pointIndex, setPointIndex] = useState(0);

  useEffect(() => {
    setPointIndex(0);
  }, [route?.path]);

  useEffect(() => {
    if (!route?.path?.length) {
      return;
    }
    const interval = setInterval(() => {
      setPointIndex((prev) => {
        if (prev >= route.path.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [route?.path]);

  const riderPosition = useMemo(() => {
    if (!route?.path?.length) {
      return null;
    }
    return route.path[Math.min(pointIndex, route.path.length - 1)];
  }, [pointIndex, route?.path]);

  const center = route?.path?.[0] || { lat: route?.source?.latitude || 12.96762, lng: route?.source?.longitude || 80.15031 };

  return (
    <div className="delivery-map-wrapper">
      <div className="delivery-map-meta">
        <div className="delivery-meta-card">
          <p>Pickup</p>
          <h4>{route?.source?.label || 'Kitchen Hub'}</h4>
          <span>{route?.source?.formatted_address}</span>
        </div>
        <div className="delivery-meta-card">
          <p>Drop</p>
          <h4>{route?.destination?.label || 'Primary Address'}</h4>
          <span>{route?.destination?.formatted_address}</span>
        </div>
        <div className="delivery-meta-card">
          <p>ETA</p>
          <h4>{route?.etaMinutes ? `${route.etaMinutes} mins` : '--'}</h4>
          <span>{route?.distanceKm ? `${route.distanceKm} km away` : ''}</span>
        </div>
      </div>
      <div className="delivery-map">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {route?.path?.length ? <FitBounds path={route.path} /> : null}
          {route?.path?.length ? (
            <Polyline positions={route.path.map((point) => [point.lat, point.lng])} color="#ff6b35" weight={6} opacity={0.8} />
          ) : null}
          {route?.source ? (
            <Marker position={{ lat: route.source.latitude, lng: route.source.longitude }} icon={createPin('Store')} />
          ) : null}
          {route?.destination ? (
            <Marker position={{ lat: route.destination.latitude, lng: route.destination.longitude }} icon={createPin('Home')} />
          ) : null}
          {riderPosition ? <Marker position={riderPosition} icon={riderIcon} /> : null}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMapTracking;


