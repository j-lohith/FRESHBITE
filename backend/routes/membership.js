const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');


// Get membership info
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT membership_type, membership_expires_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];
    const isActive = user.membership_type !== 'none' && 
                     (!user.membership_expires_at || new Date(user.membership_expires_at) > new Date());

    res.json({
      membership_type: user.membership_type,
      membership_expires_at: user.membership_expires_at,
      is_active: isActive
    });
  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update membership
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { membership_type } = req.body;
    const validTypes = ['bronze', 'silver', 'gold'];

    if (!validTypes.includes(membership_type)) {
      return res.status(400).json({ message: 'Invalid membership type' });
    }

    // Set expiration to 1 year from now
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    await pool.query(
      'UPDATE users SET membership_type = ?, membership_expires_at = ? WHERE id = ?',
      [membership_type, expiresAt, req.user.id]
    );

    res.json({ message: 'Membership upgraded successfully' });
  } catch (error) {
    console.error('Upgrade membership error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get membership benefits
router.get('/benefits', (req, res) => {
  const benefits = {
    bronze: {
      name: 'Bronze',
      price: 9.99,
      benefits: [
        '5% discount on all orders',
        'Free delivery on orders above $30',
        'Priority customer support',
        'Early access to new items'
      ]
    },
    silver: {
      name: 'Silver',
      price: 19.99,
      benefits: [
        'All Bronze benefits',
        '10% discount on all orders',
        'Free delivery on orders above $20',
        'Birthday special offer',
        'Monthly exclusive deals'
      ]
    },
    gold: {
      name: 'Gold',
      price: 39.99,
      benefits: [
        'All Silver benefits',
        '15% discount on all orders',
        'Free delivery on all orders',
        'VIP customer support',
        'Exclusive events access',
        'Quarterly free meal'
      ]
    }
  };

  res.json(benefits);
});

module.exports = router;

