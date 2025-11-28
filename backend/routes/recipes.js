const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM recipes';
    const params = [];
    const conditions = [];

    if (category && category !== 'all') {
      conditions.push(`category = ?`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const [result] = await pool.query(query, params);
    res.json(result);
  } catch (error) {
    console.error('Recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

