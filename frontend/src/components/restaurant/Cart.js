import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity, getTotalPrice, user }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    alert('Thank you for your order! This is a demo application.');
  };

  if (cart.length === 0) {
    return (
      <div className="cart cart--empty">
        <div className="cart-empty-state">
          <FiShoppingBag size={64} className="empty-icon" />
          <h3>Your cart is empty</h3>
          <p>Add delicious items to get started!</p>
          <button onClick={() => navigate('/')} className="shop-now-btn">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2 className="cart-title">
        Your Order ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
      </h2>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">
              <img 
                src={item.image_url || `https://via.placeholder.com/80x80/667eea/ffffff?text=${item.name[0]}`} 
                alt={item.name}
              />
            </div>

            <div className="cart-item-details">
              <h4 className="cart-item-name">{item.name}</h4>
              <p className="cart-item-price">₹{parseFloat(item.price).toFixed(2)} each</p>

              <div className="cart-item-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="cart-item-total">
            ₹{(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <span className="total-price">₹{getTotalPrice().toFixed(2)}</span>
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>
          {user ? 'Proceed to Checkout' : 'Login to Checkout'}
        </button>

        <p className="secure-note">
          Secure Checkout • Fast Delivery
        </p>
      </div>
    </div>
  );
};

export default Cart;