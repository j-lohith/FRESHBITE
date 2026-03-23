import L from 'leaflet';

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const PIN_SVG = encodeSvg(`
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="grad" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffe0c2"/>
        <stop offset="100%" stop-color="#ff7a00"/>
      </radialGradient>
    </defs>
    <path d="M32 62C32 62 58 40 58 24C58 11.2974 46.7026 0 34 0H30C17.2974 0 6 11.2974 6 24C6 40 32 62 32 62Z" fill="url(#grad)"/>
    <circle cx="32" cy="24" r="10" fill="#fff7ef" stroke="#ff7a00" stroke-width="4"/>
  </svg>
`);

const STORE_SVG = encodeSvg(`
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="18" width="44" height="34" rx="6" fill="#1a2e5c"/>
    <path d="M8 20 L32 4 L56 20 Z" fill="#2f4aa0"/>
    <rect x="22" y="32" width="20" height="20" fill="#fff" rx="3"/>
    <circle cx="32" cy="44" r="4" fill="#1a2e5c"/>
  </svg>
`);

export const dropPinIcon = L.icon({
  iconUrl: PIN_SVG,
  iconSize: [44, 44],
  iconAnchor: [22, 40],
  popupAnchor: [0, -36],
});

export const storeIcon = L.icon({
  iconUrl: STORE_SVG,
  iconSize: [40, 40],
  iconAnchor: [20, 36],
  popupAnchor: [0, -32],
});

export const bikeIcon = L.icon({
  iconUrl: encodeSvg(`
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffb266"/>
          <stop offset="100%" stop-color="#ff7a00"/>
        </linearGradient>
      </defs>
      <rect x="12" y="14" width="72" height="72" rx="16" fill="#fff7ef" stroke="#ff7a00" stroke-width="4"/>
      <circle cx="28" cy="66" r="10" fill="none" stroke="url(#g)" stroke-width="6"/>
      <circle cx="68" cy="66" r="10" fill="none" stroke="url(#g)" stroke-width="6"/>
      <path d="M34 36H46L56 56H42L34 36Z" fill="url(#g)"/>
      <path d="M46 36L40 54" stroke="#1a2e5c" stroke-width="4" stroke-linecap="round"/>
      <path d="M56 56L68 56" stroke="#1a2e5c" stroke-width="4" stroke-linecap="round"/>
      <path d="M46 36L58 36" stroke="#1a2e5c" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  className: 'delivery-bike-icon',
});


