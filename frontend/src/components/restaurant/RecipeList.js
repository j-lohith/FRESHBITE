import React from 'react';
import RecipeCard from './RecipeCard';
import './RecipeList.css';

const RecipeList = ({ recipes, addToCart }) => {
  if (recipes.length === 0) {
    return (
      <div className="empty-recipes">
        <p>No recipes found. Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <h2 className="recipe-list-title">Our Menu</h2>
      <div className="recipe-grid">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default RecipeList;

