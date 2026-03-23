import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import './Navbar.css';

const logoSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffb266"/>
        <stop offset="100%" stop-color="#ff7a00"/>
      </linearGradient>
    </defs>
    <rect x="8" y="10" width="48" height="44" rx="14" fill="#fff7ef" stroke="url(#b)" stroke-width="3"/>
    <path d="M20 34c6-14 18-14 24 0" fill="none" stroke="#1a2e5c" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="26" r="3" fill="url(#b)"/>
    <circle cx="40" cy="26" r="3" fill="url(#b)"/>
    <path d="M24 44h16" stroke="#1a2e5c" stroke-width="4" stroke-linecap="round"/>
  </svg>
`)}`;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const cartCount = getCartCount();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container" >
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">
              <img src={logoSvg} className='logo' alt="FreshBite" />
            </span>
            <span className="logo-text">FreshBite</span>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-menu desktop-menu">
            <Link to="/" className="navbar-link">Home</Link>
            <Link to="/membership" className="navbar-link">Membership</Link>

            <Link to="/cart" className="navbar-cart-icon">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="navbar-link">Profile</Link>
                <button onClick={handleLogout} className="navbar-button">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/register" className="navbar-button">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={()=>  setMobileMenuOpen(false)}>
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/membership" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Membership
          </Link>
          <Link to="/cart" className="mobile-link mobile-cart-link" onClick={() => setMobileMenuOpen(false)}>
            <FiShoppingCart />
            <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
          </Link>

          <div className="mobile-menu-divider"></div>

          {user ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="mobile-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-link mobile-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;