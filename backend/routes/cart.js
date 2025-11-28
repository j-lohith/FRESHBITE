const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT ci.*, r.name, r.description, r.price, r.image_url, r.category, r.offer, r.rating
       FROM cart_items ci
       JOIN recipes r ON ci.recipe_id = r.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { recipe_id, quantity } = req.body;

    if (!recipe_id) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }

    const qty = quantity || 1;

    // Check if item already exists in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND recipe_id = ?',
      [req.user.id, recipe_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND recipe_id = ?',
        [qty, req.user.id, recipe_id]
      );
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (user_id, recipe_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, recipe_id, qty]
      );
    }

    res.json({ message: 'Item added to cart', success: true });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      success: false 
    });
  }
});

// Update cart item quantity
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId = req.params.id;

    if (quantity <= 0) {
      // Remove item
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, req.user.id]);
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, cartItemId, req.user.id]
      );
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

