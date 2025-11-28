import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axios';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/recipes/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    const success = await addToCart(product, quantity);
    if (success) {
      alert('Item added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-error">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="product-details"
    >
      <div className="product-details-container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <div className="product-details-content">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-image-section"
          >
            <img src={product.image_url} alt={product.name} className="product-main-image" />
            {product.offer && (
              <div className="product-offer-badge">{product.offer}</div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-info-section"
          >
            <h1 className="product-name">{product.name}</h1>
            <div className="product-rating">
              <FiStar className="star-icon filled" />
              <span className="rating-value">{product.rating || 4.5}</span>
              <span className="rating-count">(120 reviews)</span>
            </div>
            <div className="product-price-section">
              <span className="product-price">₹{parseFloat(product.price).toFixed(2)}</span>
              {product.offer && (
                <span className="product-offer-text">{product.offer}</span>
              )}
            </div>
            <p className="product-description">{product.description}</p>
            <div className="product-category">
              <span className="category-label">Category:</span>
              <span className="category-value">{product.category}</span>
            </div>
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={handleAddToCart} className="add-to-cart-btn">
                <FiShoppingCart />
                Add to Cart
              </button>
              <button className="buy-now-btn">Buy Now</button>
            </div>
            <div className="product-features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>Free Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span>Easy Returns</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Secure Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;

