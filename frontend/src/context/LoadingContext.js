import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadingManager } from '../utils/loadingManager';

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
  setLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((count) => {
      setIsLoading(count > 0);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      startLoading: loadingManager.start,
      stopLoading: loadingManager.stop,
      setLoading: (active) => loadingManager.set(active),
    }),
    [isLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => useContext(LoadingContext);


