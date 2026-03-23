import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import './LoadingOverlay.css';

const loaderSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffb266"/>
        <stop offset="100%" stop-color="#ff7a00"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="38" fill="none" stroke="url(#g)" stroke-width="8" stroke-linecap="round" stroke-dasharray="200 80"/>
    <circle cx="60" cy="60" r="10" fill="#fff7ef" stroke="#ff7a00" stroke-width="4"/>
    <path d="M40 82c10 10 30 10 40 0" fill="none" stroke="#1a2e5c" stroke-width="6" stroke-linecap="round"/>
  </svg>
`)}`;

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <img className="loading-gif" src={loaderSvg} alt="Chef is plating your meal" />
        <p className="loading-text">Our chefs are preparing something tasty...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;


