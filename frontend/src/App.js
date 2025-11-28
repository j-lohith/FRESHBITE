import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AddressProvider } from './context/AddressContext';
import { useLoading } from './context/LoadingContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Restaurant from './components/restaurant/Restaurant';
import CartPage from './components/restaurant/CartPage';
import ProductDetails from './components/restaurant/ProductDetails';
import Membership from './components/membership/Membership';
import DeliveryTracking from './components/orders/DeliveryTracking';
import Navbar from './components/layout/Navbar';
import LoadingOverlay from './components/layout/LoadingOverlay';
import { getToken, removeToken, setToken } from './utils/auth';
import api from './utils/axios';
import NotFound from './components/layout/NotFound';
import Unauthorized401 from './components/layout/Unauthorized401';

const NavigationLoadingHandler = () => {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();
  const isInitialLoad = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    startLoading();
    timeoutRef.current = setTimeout(() => {
      stopLoading();
      timeoutRef.current = null;
    }, 450);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopLoading();
    };
  }, [location.pathname, startLoading, stopLoading]);

  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const token = getToken();
    if (token) {
      startLoading();
      api
        .get('/auth/me')
        .then(({ data }) => {
          if (data?.id) {
            setUser(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching user:', err);
          removeToken();
        })
        .finally(() => {
          stopLoading();
          setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
  }, [startLoading, stopLoading]);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="App">
        <LoadingOverlay />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <AddressProvider>
        <CartProvider>
          <Router>
            <NavigationLoadingHandler />
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/tracking/:orderId" element={user ? <DeliveryTracking /> : <Navigate to="/login" />} />
                <Route path="/" element={<Restaurant />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/401" element={<Unauthorized401 />} />
              </Routes>
            </div>
            <LoadingOverlay />
          </Router>
        </CartProvider>
      </AddressProvider>
    </AuthContext.Provider>
  );
}

export default App;

