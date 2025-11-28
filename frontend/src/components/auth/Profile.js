import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiHelpCircle, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axios';
import AddressManager from '../addresses/AddressManager';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'addresses', label: 'Addresses', icon: <FiMapPin /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingBag /> },
    { id: 'help', label: 'Help & Contact', icon: <FiHelpCircle /> }
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar-large">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="Profile" />
            ) : (
              <span>{user.first_name?.[0] || user.username[0].toUpperCase()}</span>
            )}
          </div>
          <h2 className="profile-name-large">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </h2>
          <p className="profile-email">{user.email}</p>
          {user.membership_type && user.membership_type !== 'none' && (
            <div className="membership-badge">
              {user.membership_type.toUpperCase()} Member
            </div>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-info"
              >
                <h3>Profile Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Username</label>
                    <p>{user.username}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="info-item">
                    <label>First Name</label>
                    <p>{user.first_name || 'Not set'}</p>
                  </div>
                  <div className="info-item">
                    <label>Last Name</label>
                    <p>{user.last_name || 'Not set'}</p>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <p>{user.phone || 'Not set'}</p>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="orders-section"
              >
                <h3>Order History</h3>
                {loading ? (
                  <div className="loading">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <FiShoppingBag size={48} />
                    <p>No orders yet</p>
                    <button onClick={() => navigate('/')}>Start Shopping</button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="order-card"
                      >
                        <div className="order-header">
                          <div>
                            <h4>Order #{order.id}</h4>
                            <p>{formatDate(order.created_at)}</p>
                          </div>
                          <div className="order-status" data-status={order.status}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div className="order-items-preview">
                          {order.items && order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="order-item-preview">
                              <img src={item.image_url} alt={item.name} />
                              <span>{item.name} x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <p>+{order.items.length - 3} more items</p>
                          )}
                        </div>
                        <div className="order-footer">
                          <span className="order-total">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => navigate(`/tracking/${order.id}`)}
                              className="track-button"
                            >
                              Track Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="addresses-section"
              >
                <AddressManager />
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="help-section"
              >
                <h3>Help & Contact Us</h3>
                <div className="help-content">
                  <div className="help-card">
                    <FiMail />
                    <h4>Email Support</h4>
                    <p>support@freshbite.com</p>
                    <p>We'll respond within 24 hours</p>
                  </div>
                  <div className="help-card">
                    <FiPhone />
                    <h4>Phone Support</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                  <div className="help-card">
                    <FiMapPin />
                    <h4>Address</h4>
                    <p>123 Restaurant Street</p>
                    <p>City, State 12345</p>
                  </div>
                </div>
                <div className="faq-section">
                  <h4>Frequently Asked Questions</h4>
                  <div className="faq-item">
                    <h5>How do I track my order?</h5>
                    <p>Go to your Orders section and click "Track Order" on any active order.</p>
                  </div>
                  <div className="faq-item">
                    <h5>What payment methods do you accept?</h5>
                    <p>We accept all major credit cards and Razorpay payments.</p>
                  </div>
                  <div className="faq-item">
                    <h5>Can I cancel my order?</h5>
                    <p>Orders can be cancelled within 30 minutes of placement. Contact support for assistance.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
