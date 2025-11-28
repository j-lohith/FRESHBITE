import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import './Navbar.css';
import logo from "../../assets/logo.png"

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
            <span className="logo-icon"><img src={logo} className='logo'/></span>
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