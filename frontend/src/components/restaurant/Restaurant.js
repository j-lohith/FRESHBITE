import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import api from '../../utils/axios';
import RecipeList from './RecipeList';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import './Restaurant.css';

const Restaurant = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const banners = [
    {
      id: 1,
      title: "Today's Special Offer",
      subtitle: "Get 20% off on all pizzas",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "Weekend Deals",
      subtitle: "Buy 2 Get 1 Free on desserts",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      title: "New Arrivals",
      subtitle: "Try our latest menu items",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      id: 4,
      title: "Flash Sale",
      subtitle: "Up to 50% off on selected items",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    cssEase: 'linear'
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, selectedCategory]);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
      setFilteredRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecipes(filtered);
  };

  const categories = ['all', ...new Set(recipes.map(recipe => recipe.category))];

  return (
    <div className="restaurant-container">
      <div className="banner-carousel">
        <Slider {...sliderSettings}>
          {banners.map((banner) => (
            <div key={banner.id} className="banner-slide">
              <div
                className="banner-content"
                style={{ background: banner.color }}
              >
                <div className="banner-text">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="banner-title"
                  >
                    {banner.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="banner-subtitle"
                  >
                    {banner.subtitle}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="banner-button"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Shop Now
                  </motion.button>
                </div>
                <div className="banner-image">
                  <img src={banner.image} alt={banner.title} />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="restaurant-main">
        <div className="restaurant-filters">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {loading ? (
          <div className="loading">Loading recipes...</div>
        ) : (
          <RecipeList
            recipes={filteredRecipes}
            addToCart={addToCart}
          />
        )}
      </div>
    </div>
  );
};

export default Restaurant;

