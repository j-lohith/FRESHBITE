import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import { bikeIcon, dropPinIcon, storeIcon } from '../../utils/mapIcons';
import './DeliveryMapTracking.css';

const DeliveryMapTracking = ({ route, status, etaMinutes }) => {
  const mapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const path = route?.path || [];
  const source = route?.source;
  const destination = route?.destination;

  useEffect(() => {
    setProgress(0);
    if (!path.length) return () => {};
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return Number((prev + 0.02).toFixed(3));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [path]);

  useEffect(() => {
    if (!mapRef.current || !path.length) return;
    const bounds = L.latLngBounds(path.map((point) => [point.lat, point.lng]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [path]);

  const markerPosition = useMemo(() => {
    if (!path.length) return null;
    if (progress >= 1) {
      return path[path.length - 1];
    }
    const scaled = progress * (path.length - 1);
    const lowerIndex = Math.floor(scaled);
    const upperIndex = Math.min(lowerIndex + 1, path.length - 1);
    const ratio = scaled - lowerIndex;
    const start = path[lowerIndex];
    const end = path[upperIndex];
    return {
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    };
  }, [path, progress]);

  if (!path.length || !source || !destination) {
    return (
      <div className="delivery-map__fallback">
        We&apos;re getting your route ready. Hold tight!
      </div>
    );
  }

  return (
    <div className="delivery-map">
      <MapContainer
        whenCreated={(instance) => {
          mapRef.current = instance;
        }}
        center={[source.latitude, source.longitude]}
        zoom={13}
        scrollWheelZoom
        className="delivery-map__canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[source.latitude, source.longitude]} icon={storeIcon} />
        <Marker position={[destination.latitude, destination.longitude]} icon={dropPinIcon} />
        <Polyline positions={path.map((point) => [point.lat, point.lng])} color="#ff7a00" weight={5} opacity={0.8} />
        {markerPosition && <Marker position={[markerPosition.lat, markerPosition.lng]} icon={bikeIcon} />}
      </MapContainer>

      <div className="delivery-map__info">
        <div>
          <p className="delivery-map__label">Status</p>
          <h4 className="delivery-map__status">{status.replace('_', ' ')}</h4>
        </div>
        <div>
          <p className="delivery-map__label">ETA</p>
          <h4>{etaMinutes || route.etaMinutes} min</h4>
        </div>
        <div>
          <p className="delivery-map__label">Distance</p>
          <h4>{route.distanceKm} km</h4>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMapTracking;


