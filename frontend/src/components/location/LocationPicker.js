import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import { FiCrosshair, FiMapPin, FiSearch } from 'react-icons/fi';
import api from '../../utils/axios';
import { dropPinIcon } from '../../utils/mapIcons';
import './LocationPicker.css';

const DEFAULT_COORDS = {
  lat: 12.96762,
  lng: 80.15031,
};

const SearchSuggestions = ({ results, onSelect, loading }) => {
  if (!results.length && !loading) {
    return null;
  }
  return (
    <div className="location-picker__suggestions">
      {loading && <div className="location-picker__suggestion">Searching...</div>}
      {results.map((item) => (
        <button
          key={item.place_id}
          type="button"
          className="location-picker__suggestion"
          onClick={() => onSelect(item)}
        >
          <FiMapPin />
          <div>
            <strong>{item.city || item.state || 'Pinned Location'}</strong>
            <p>{item.formatted_address}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

const MapClickHandler = ({ onSelect, draggableRef }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
      if (draggableRef.current) {
        draggableRef.current.setLatLng(e.latlng);
      }
    },
  });
  return null;
};

const LocationPicker = ({
  title = 'Pin your delivery location',
  initialValue,
  onLocationResolved,
  height = 320,
  showPathFromStore = false,
}) => {
  const [position, setPosition] = useState(initialValue || DEFAULT_COORDS);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [loadingReverse, setLoadingReverse] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const debounceTimer = useRef(null);

  const emitLocation = useCallback(
    (meta) => {
      if (typeof onLocationResolved === 'function') {
        onLocationResolved(meta);
      }
    },
    [onLocationResolved]
  );

  const reverseGeocode = useCallback(
    async ({ lat, lng }) => {
      setLoadingReverse(true);
      setError(null);
      try {
        const { data } = await api.get('/addresses/reverse', {
          params: { lat, lon: lng },
        });
        const payload = {
          ...data,
          latitude: data.latitude ?? lat,
          longitude: data.longitude ?? lng,
        };
        setAddress(payload);
        emitLocation(payload);
      } catch (err) {
        console.error('Reverse geocode failed', err);
        setError('Unable to fetch address. Try moving the pin again.');
        emitLocation({ latitude: lat, longitude: lng });
      } finally {
        setLoadingReverse(false);
      }
    },
    [emitLocation]
  );

  const moveTo = useCallback(
    (coords, shouldReverse = true) => {
      if (!coords?.lat || !coords?.lng) return;
      const normalized = { lat: coords.lat, lng: coords.lng };
      setPosition(normalized);
      if (mapRef.current) {
        mapRef.current.setView([normalized.lat, normalized.lng], Math.max(mapRef.current.getZoom(), 15), {
          animate: true,
        });
      }
      if (shouldReverse) {
        reverseGeocode(normalized);
      }
    },
    [reverseGeocode]
  );

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        moveTo(coords);
      },
      () => {
        setError('Unable to fetch your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [moveTo]);

  useEffect(() => {
    if (!initialValue && navigator.geolocation) {
      locateUser();
    }
  }, [initialValue]);

  useEffect(() => {
    if (initialValue?.lat && initialValue?.lng) {
      setPosition(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      return undefined;
    }

    setSearching(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/addresses/search', {
          params: { q: searchTerm.trim() },
        });
        setSearchResults(data);
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const handleSuggestionSelect = (suggestion) => {
    setSearchResults([]);
    setSearchTerm('');
    setAddress(suggestion);
    moveTo({ lat: suggestion.latitude, lng: suggestion.longitude }, false);
    emitLocation(suggestion);
  };

  const polyline = useMemo(() => {
    if (!showPathFromStore || !address?.latitude || !address?.longitude) {
      return null;
    }
    return [
      [DEFAULT_COORDS.lat, DEFAULT_COORDS.lng],
      [address.latitude, address.longitude],
    ];
  }, [address, showPathFromStore]);

  const mapCenter = useMemo(
    () => [position?.lat ?? DEFAULT_COORDS.lat, position?.lng ?? DEFAULT_COORDS.lng],
    [position]
  );

  return (
    <div className="location-picker">
      <div className="location-picker__header">
        <div>
          <h4>{title}</h4>
          <p>Drag & drop the pin or search for a location to update your delivery spot.</p>
        </div>
        <button type="button" className="location-picker__locate" onClick={locateUser}>
          <FiCrosshair />
          Use my location
        </button>
      </div>

      <div className="location-picker__search">
        <FiSearch />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search for a nearby landmark or street"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <SearchSuggestions results={searchResults} onSelect={handleSuggestionSelect} loading={searching} />

      {/* <div className="location-picker__map" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={mapCenter}
            draggable
            icon={dropPinIcon}
            ref={markerRef}
            eventHandlers={{
              dragend: (event) => {
                const latlng = event.target.getLatLng();
                setPosition(latlng);
                reverseGeocode(latlng);
              },
            }}
          />
          <MapClickHandler onSelect={moveTo} draggableRef={markerRef} />
          {polyline && <Polyline positions={polyline} color="#ff7a00" dashArray="6 6" weight={3} />}
        </MapContainer>
      </div> */}

      <div className="location-picker__footer">
        <div>
          <p className="location-picker__label">Pinned Address</p>
          <p className="location-picker__address">
            {loadingReverse && 'Fetching address...'}
            {!loadingReverse && address?.formatted_address}
            {!loadingReverse && !address?.formatted_address && 'Move the pin to fetch address details'}
          </p>
          {error && <p className="location-picker__error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;

// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import L from 'leaflet';
// import api from '../../utils/axios';
// import './LocationPicker.css';

// const DEFAULT_COORDS = { lat: 12.96762, lng: 80.15031 }; // Chennai - Pallavaram

// const markerIcon = L.divIcon({
//   className: 'location-marker-icon',
//   html: '<span class="location-marker"></span>',
//   iconSize: [30, 30],
//   iconAnchor: [15, 30],
// });

// const DraggableMarker = ({ position, onMove }) => {
//   useMapEvents({});

//   return (
//     <Marker
//       position={position}
//       draggable
//       icon={markerIcon}
//       eventHandlers={{
//         dragend: (event) => {
//           const { lat, lng } = event.target.getLatLng();
//           onMove({ lat, lng });
//         },
//       }}
//     />
//   );
// };

// const LocationPicker = ({ value, onChange, height = 320, autoLocateOnMount = false }) => {
//   const [coords, setCoords] = useState(value?.coordinates || value || DEFAULT_COORDS);
//   const [address, setAddress] = useState(value?.formatted_address || '');
//   const [search, setSearch] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [isLocating, setIsLocating] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   const handleEmit = useCallback(
//     (payload) => {
//       if (onChange) {
//         onChange({
//           ...payload,
//           coordinates: { lat: payload.latitude, lng: payload.longitude },
//         });
//       }
//     },
//     [onChange]
//   );

//   const reverseGeocode = useCallback(
//     async ({ lat, lng }) => {
//       try {
//         const { data } = await api.get('/addresses/reverse', { params: { lat, lon: lng } });
//         setAddress(data.formatted_address);
//         handleEmit({
//           ...data,
//           address_line: data.formatted_address,
//           latitude: data.latitude,
//           longitude: data.longitude,
//         });
//       } catch (error) {
//         console.error('Reverse geocoding failed', error);
//       }
//     },
//     [handleEmit]
//   );

//   const moveMarker = useCallback(
//     async (next) => {
//       setCoords(next);
//       await reverseGeocode(next);
//     },
//     [reverseGeocode]
//   );

//   const requestCurrentLocation = useCallback(() => {
//     if (!navigator.geolocation) {
//       alert('Geolocation is not supported on this device.');
//       return;
//     }
//     setIsLocating(true);
//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         await moveMarker(next);
//         setIsLocating(false);
//       },
//       (err) => {
//         console.error('Geolocation error:', err);
//         setIsLocating(false);
//         alert('Unable to fetch your current location. Please drag the pin manually.');
//       },
//       { enableHighAccuracy: true }
//     );
//   }, [moveMarker]);

//   useEffect(() => {
//     if (value?.latitude && value?.longitude) {
//       setCoords({ lat: value.latitude, lng: value.longitude });
//       setAddress(value.formatted_address || value.address_line || '');
//     }
//   }, [value]);

//   useEffect(() => {
//     if (autoLocateOnMount) {
//       requestCurrentLocation();
//     }
//   }, [autoLocateOnMount, requestCurrentLocation]);

//   const handleSearch = async (query) => {
//     if (!query || query.length < 3) {
//       setSuggestions([]);
//       return;
//     }
//     setIsSearching(true);
//     try {
//       const { data } = await api.get('/addresses/search', { params: { q: query } });
//       setSuggestions(data);
//     } catch (error) {
//       console.error('Search error:', error);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const mapKey = useMemo(() => `${coords.lat}-${coords.lng}`, [coords]);

//   return (
//     <div className="location-picker">
//       <div className="location-picker__header">
//         <div>
//           <p className="location-picker__label">Delivery Location</p>
//           <p className="location-picker__address">{address || 'Drag the marker or search for a place'}</p>
//         </div>
//         <button className="location-picker__locate-btn" type="button" onClick={requestCurrentLocation}>
//           {isLocating ? 'Detecting...' : 'Use Current Location'}
//         </button>
//       </div>

//       <div className="location-picker__search">
//         <input
//           type="text"
//           placeholder="Search for a building, street, or area"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             handleSearch(e.target.value);
//           }}
//         />
//         {isSearching && <span className="location-picker__search-spinner" />}
//         {!!suggestions.length && (
//           <div className="location-picker__suggestions">
//             {suggestions.map((suggestion) => (
//               <button
//                 key={suggestion.place_id}
//                 type="button"
//                 onClick={() => {
//                   setSearch(suggestion.formatted_address);
//                   setSuggestions([]);
//                   const next = { lat: suggestion.latitude, lng: suggestion.longitude };
//                   setCoords(next);
//                   setAddress(suggestion.formatted_address);
//                   handleEmit({
//                     ...suggestion,
//                     address_line: suggestion.formatted_address,
//                     latitude: suggestion.latitude,
//                     longitude: suggestion.longitude,
//                   });
//                 }}
//               >
//                 {suggestion.formatted_address}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="location-picker__map" style={{ height }}>
//         <MapContainer key={mapKey} center={coords} zoom={16} scrollWheelZoom className="location-map">
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           <DraggableMarker position={coords} onMove={moveMarker} />
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default LocationPicker;


