import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useAddresses } from '../../context/AddressContext';
import api from '../../utils/axios';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addresses, primaryAddress, loadingAddresses } = useAddresses();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (primaryAddress?.id) {
      setSelectedAddressId(primaryAddress.id);
    }
  }, [primaryAddress]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!selectedAddressId) {
      alert('Please select a delivery address before checkout.');
      return;
    }

    setProcessing(true);
    try {
      const totalAmount = getTotalPrice();

      // Calculate final amount with membership discount
      let finalAmount = totalAmount;
      if (user?.membership_type && user.membership_type !== 'none') {
        const discountPercent = user.membership_type === 'gold' ? 15 : 
                              user.membership_type === 'silver' ? 10 : 5;
        finalAmount = totalAmount * (1 - discountPercent / 100);
      }

      // Create Razorpay order
      const paymentResponse = await api.post('/payment/create-order', {
        amount: finalAmount,
        currency: 'INR',
      });

      // Load Razorpay script if not already loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.body.appendChild(script);
        });
      };

      try {
        await loadRazorpayScript();

        // Get Razorpay key from environment or use test key
       // Fetch public key from backend
       const keyResponse = await api.get('/payment/key');
       const razorpayKey = keyResponse.data.key;

        if (!razorpayKey) {
          console.warn('Razorpay key not found in environment variables');
        }

        const options = {
          key: razorpayKey || 'rzp_test_1234567890',
          amount: paymentResponse.data.amount, // Already in paise from backend
          currency: paymentResponse.data.currency,
          name: 'FreshBite',
          description: 'Order Payment',
          order_id: paymentResponse.data.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verifyResponse = await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.data.success) {
                // Create order
                const orderResponse = await api.post('/orders/create', {
                  total_amount: finalAmount,
                  payment_id: response.razorpay_payment_id,
                  payment_status: 'completed',
                  address_id: selectedAddressId,
                });

                clearCart();
                navigate(`/tracking/${orderResponse.data.id}`);
              } else {
                alert('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed');
            }
          },
          prefill: {
            name: (user.first_name || '') + ' ' + (user.last_name || ''),
            email: user.email,
            contact: user.phone || ''
          },
          theme: {
            color: '#667eea'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response) => {
          alert('Payment failed. Please try again.');
        });
        razorpay.open();
      } catch (scriptError) {
        console.error('Error loading Razorpay:', scriptError);
        // For demo purposes, proceed with mock payment
        const orderResponse = await api.post('/orders/create', {
          total_amount: finalAmount,
          payment_id: `mock_payment_${Date.now()}`,
          payment_status: 'completed',
          address_id: selectedAddressId,
        });
        clearCart();
        navigate(`/tracking/${orderResponse.data.id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="cart-page"
      >
        <div className="cart-empty-state">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items to get started!</p>
            <button onClick={() => navigate('/')} className="shop-now-button">
              Shop Now
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cart-page"
    >
      <div className="cart-page-container">
        <h1 className="cart-page-title">My Cart</h1>
        <div className="cart-content">
          <div className="cart-items-section">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cart-item-card"
              >
                
                <img src={item.image_url} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-description">{item.description}</p>
                  <div className="cart-item-price-row">
                    <span className="cart-item-price">₹{parseFloat(item.price).toFixed(2)}</span>
                    {item.offer && <span className="cart-item-offer">{item.offer}</span>}
                  </div>
                </div>

                <div className="cart-item-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                {/* ₹{(parseFloat(item.price) * item.quantity).toFixed(2)} */}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-item-btn"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
          <div className="cart-summary">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="summary-card"
            >
              <h2>Order Summary</h2>

              <div className="delivery-address-card">
                <div className="delivery-address-card__header">
                  <span>Deliver to</span>
                  <button type="button" onClick={() => navigate('/profile')}>
                    Manage addresses
                  </button>
                </div>
                {loadingAddresses && <p>Loading addresses...</p>}
                {!loadingAddresses && addresses.length === 0 && (
                  <p className="delivery-address-card__empty">
                    No addresses saved yet. Add one from your profile before checkout.
                  </p>
                )}
                {!loadingAddresses && addresses.length > 0 && (
                  <div className="delivery-address-card__list">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`delivery-address-option ${
                          selectedAddressId === addr.id ? 'delivery-address-option--active' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div>
                          <strong>{addr.label}</strong>
                          <p>{addr.formatted_address || addr.address_line}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Items breakdown */}
              <div className="summary-items-list">
                {cart.map((item) => {
                  const itemTotal = parseFloat(item.price) * item.quantity;
                  const offerPercent = item.offer ? parseFloat(item.offer.replace(/[^0-9.]/g, '')) : 0;
                  const originalPrice = offerPercent > 0 ? itemTotal / (1 - offerPercent / 100) : itemTotal;
                  const savings = offerPercent > 0 ? originalPrice - itemTotal : 0;
                  
                  return (
                    <div key={item.id} className="summary-item-row">
                      <div className="summary-item-info">
                        <span className="summary-item-name">{item.name} x{item.quantity}</span>
                        {offerPercent > 0 && (
                          <span className="summary-item-offer">{item.offer}</span>
                        )}
                      </div>
                      <div className="summary-item-prices">
                        {offerPercent > 0 && (
                          <span className="summary-item-original">${originalPrice.toFixed(2)}</span>
                        )}
                        <span className="summary-item-final">₹{itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              {/* Price breakdown */}
              <div className="summary-row">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              {(() => {
                const totalSavings = cart.reduce((sum, item) => {
                  const offerPercent = item.offer ? parseFloat(item.offer.replace(/[^0-9.]/g, '')) : 0;
                  if (offerPercent > 0) {
                    const itemTotal = parseFloat(item.price) * item.quantity;
                    const originalPrice = itemTotal / (1 - offerPercent / 100);
                    return sum + (originalPrice - itemTotal);
                  }
                  return sum;
                }, 0);
                
                return totalSavings > 0 ? (
                  <div className="summary-row savings-row">
                    <span>Total Savings</span>
                    <span className="savings-amount">₹{totalSavings.toFixed(2)}</span>
                  </div>
                ) : null;
              })()}

              <div className="summary-row">
                <span>Delivery Charges</span>
                <span className="free-delivery">FREE</span>
              </div>

              {user?.membership_type && user.membership_type !== 'none' && (() => {
                const discountPercent = user.membership_type === 'gold' ? 15 : 
                                      user.membership_type === 'silver' ? 10 : 5;
                const discountAmount = getTotalPrice() * (discountPercent / 100);
                return (
                  <div className="summary-row membership-discount">
                    <span>Membership Discount ({discountPercent}%)</span>
                    <span className="discount-amount">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                );
              })()}

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{(() => {
                  let finalTotal = getTotalPrice();
                  if (user?.membership_type && user.membership_type !== 'none') {
                    const discountPercent = user.membership_type === 'gold' ? 15 : 
                                          user.membership_type === 'silver' ? 10 : 5;
                    finalTotal = finalTotal * (1 - discountPercent / 100);
                  }
                  return finalTotal.toFixed(2);
                })()}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing || !selectedAddressId}
                className="checkout-btn"
              >
                {processing ? 'Processing...' : user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
              {!user && (
                <p className="login-prompt">Please login to checkout</p>
              )}
              {user && !selectedAddressId && (
                <p className="login-prompt">Select or add a delivery address to continue.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;

