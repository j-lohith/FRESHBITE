const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Helper: Escape double quotes in strings
const escapeJsonString = (str) => {
  if (str === null || str === undefined) return '';
  return str.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

// Universal query to get order + items (works on MySQL 5.5+)
const baseOrderFields = `
  o.*,
  ua.label AS address_label,
  ua.formatted_address AS address_formatted,
  ua.latitude AS address_latitude,
  ua.longitude AS address_longitude,
  ua.city AS address_city,
  ua.state AS address_state,
  ua.postal_code AS address_postal_code,
  ua.country AS address_country,
  COALESCE(
    CONCAT('[',
      GROUP_CONCAT(
        CONCAT(
          '{"id":', oi.id,
          ',"recipe_id":', oi.recipe_id,
          ',"quantity":', oi.quantity,
          ',"price":', oi.price,
          ',"name":"', REPLACE(IFNULL(r.name, ''), '"', '\\"'),
          '","image_url":"', IFNULL(r.image_url, ''), '"}'
        )
      ),
    ']'), '[]'
  ) AS items
`;

const getOrderWithItemsQuery = `
  SELECT ${baseOrderFields}
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN recipes r ON oi.recipe_id = r.id
  LEFT JOIN user_addresses ua ON o.address_id = ua.id
  WHERE o.id = ? AND o.user_id = ?
  GROUP BY o.id
`;

const getUserOrdersQuery = `
  SELECT ${baseOrderFields}
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN recipes r ON oi.recipe_id = r.id
  LEFT JOIN user_addresses ua ON o.address_id = ua.id
  WHERE o.user_id = ?
  GROUP BY o.id
  ORDER BY o.created_at DESC
`;

const normalizeOrderRecord = (record) => {
  const parsed = { ...record };
  parsed.items = JSON.parse(parsed.items);
  if (parsed.address_latitude !== null && parsed.address_latitude !== undefined) {
    parsed.address_latitude = Number(parsed.address_latitude);
  }
  if (parsed.address_longitude !== null && parsed.address_longitude !== undefined) {
    parsed.address_longitude = Number(parsed.address_longitude);
  }
  return parsed;
};

// Create order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { total_amount, delivery_address, payment_id, payment_status, address_id } = req.body;

    const [cartItems] = await pool.query(
      `SELECT ci.recipe_id, ci.quantity, r.price
       FROM cart_items ci
       JOIN recipes r ON ci.recipe_id = r.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let selectedAddressId = address_id;
    let selectedAddress = null;

    if (selectedAddressId) {
      const [addressRows] = await pool.query(
        'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
        [selectedAddressId, req.user.id]
      );
      if (!addressRows.length) {
        return res.status(404).json({ message: 'Address not found' });
      }
      selectedAddress = addressRows[0];
    } else {
      const [defaultRows] = await pool.query(
        'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC LIMIT 1',
        [req.user.id]
      );
      if (!defaultRows.length) {
        return res.status(400).json({ message: 'Please add a delivery address before placing an order' });
      }
      selectedAddress = defaultRows[0];
      selectedAddressId = selectedAddress.id;
    }

    const deliverySnapshot =
      delivery_address || selectedAddress.formatted_address || selectedAddress.address_line;

    const [orderResult] = await pool.query(
      `INSERT INTO orders (user_id, total_amount, delivery_address, payment_id, payment_status, address_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, total_amount, deliverySnapshot, payment_id, payment_status || 'pending', selectedAddressId]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, recipe_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.recipe_id, item.quantity, item.price]
      );
    }

    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    // Fetch full order with items using compatible query
    const [orders] = await pool.query(getOrderWithItemsQuery, [orderId, req.user.id]);

    if (orders.length === 0) {
      return res.status(500).json({ message: 'Failed to retrieve created order' });
    }

    const order = normalizeOrderRecord(orders[0]);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(getUserOrdersQuery, [req.user.id]);

    const parsedOrders = orders.map(normalizeOrderRecord);

    res.json(parsedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.query(getOrderWithItemsQuery, [req.params.id, req.user.id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = normalizeOrderRecord(orders[0]);

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'packed', 'on_the_way', 'arriving', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;