import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import './RecipeCard.css';

const RecipeCard = ({ recipe, addToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${recipe.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(recipe);
  };

  return (
    <motion.div
      className="recipe-card"
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="recipe-image-container">
        <img
          src={recipe.image_url || 'https://via.placeholder.com/300x200?text=Recipe'}
          alt={recipe.name}
          className="recipe-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Recipe';
          }}
        />
        {recipe.offer && (
          <div className="recipe-offer-badge">{recipe.offer}</div>
        )}
        {recipe.rating && (
          <div className="recipe-rating-badge">
            <FiStar className="star-icon" />
            <span>{recipe.rating}</span>
          </div>
        )}
      </div>
      <div className="recipe-content">
        <div className="recipe-header">
          <h3 className="recipe-name">{recipe.name}</h3>
          <span className="recipe-category">{recipe.category}</span>
        </div>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-footer">
          <span className="recipe-price">₹{parseFloat(recipe.price).toFixed(2)}</span>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;

