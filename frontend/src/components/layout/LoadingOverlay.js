import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import loaderGif from '../../assets/food-loader.gif';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <img className="loading-gif" src={loaderGif} alt="Chef is plating your meal" />
        <p className="loading-text">Our chefs are preparing something tasty...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;


