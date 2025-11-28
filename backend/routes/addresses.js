const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const MAX_ADDRESSES = 5;
const NOMINATIM_HEADERS = {
  'User-Agent': 'FreshBite/1.0 (contact@freshbite.app)',
  'Accept-Language': 'en',
};

const sanitizeAddressPayload = (payload = {}) => {
  const safe = {
    label: payload.label || 'Other',
    address_line: payload.address_line || payload.formatted_address || '',
    landmark: payload.landmark || '',
    city: payload.city || '',
    state: payload.state || '',
    postal_code: payload.postal_code || '',
    country: payload.country || '',
    latitude: Number(payload.latitude),
    longitude: Number(payload.longitude),
    place_id: payload.place_id || '',
    formatted_address: payload.formatted_address || payload.address_line || '',
    instructions: payload.instructions || '',
  };

  if (
    safe.latitude === undefined ||
    safe.longitude === undefined ||
    Number.isNaN(safe.latitude) ||
    Number.isNaN(safe.longitude)
  ) {
    throw new Error('Latitude and longitude are required');
  }

  return safe;
};

const formatAddressResponse = (record) => ({
  id: record.id,
  user_id: record.user_id,
  label: record.label,
  address_line: record.address_line,
  landmark: record.landmark,
  city: record.city,
  state: record.state,
  postal_code: record.postal_code,
  country: record.country,
  latitude: Number(record.latitude),
  longitude: Number(record.longitude),
  place_id: record.place_id,
  formatted_address: record.formatted_address,
  instructions: record.instructions,
  is_default: Boolean(record.is_default),
  created_at: record.created_at,
  updated_at: record.updated_at,
});

const fetchNominatim = async (endpoint, params) => {
  const { data } = await axios.get(`${NOMINATIM_BASE}/${endpoint}`, {
    params: { format: 'json', addressdetails: 1, limit: 5, ...params },
    headers: NOMINATIM_HEADERS,
  });
  return data;
};

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters' });
    }

    const data = await fetchNominatim('search', { q });
    const suggestions = data.map((item) => ({
      place_id: item.place_id,
      formatted_address: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      city: item.address.city || item.address.town || item.address.village || '',
      state: item.address.state || '',
      country: item.address.country || '',
      postal_code: item.address.postcode || '',
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Address search error:', error.message);
    res.status(500).json({ message: 'Unable to fetch address suggestions' });
  }
});

router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const data = await fetchNominatim('reverse', { lat, lon, zoom: 18 });
    res.json({
      place_id: data.place_id,
      formatted_address: data.display_name,
      latitude: Number(data.lat),
      longitude: Number(data.lon),
      city: data.address.city || data.address.town || data.address.village || '',
      state: data.address.state || '',
      country: data.address.country || '',
      postal_code: data.address.postcode || '',
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    res.status(500).json({ message: 'Unable to reverse geocode location' });
  }
});

router.use(authMiddleware);

router.get('/primary', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'No address found' });
    }

    res.json(formatAddressResponse(rows[0]));
  } catch (error) {
    console.error('Fetch primary address error:', error);
    res.status(500).json({ message: 'Unable to fetch primary address' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC`,
      [req.user.id]
    );
    res.json(rows.map(formatAddressResponse));
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ message: 'Unable to fetch addresses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { is_default } = req.body;
    const addressPayload = sanitizeAddressPayload(req.body);

    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM user_addresses WHERE user_id = ?', [
      req.user.id,
    ]);
    const total = countRows[0].total;

    if (total >= MAX_ADDRESSES) {
      return res.status(400).json({ message: `You can only save up to ${MAX_ADDRESSES} addresses.` });
    }

    if (is_default || total === 0) {
      await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await pool.query(
      `INSERT INTO user_addresses 
        (user_id, label, address_line, landmark, city, state, postal_code, country, latitude, longitude, place_id, formatted_address, instructions, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        addressPayload.label,
        addressPayload.address_line,
        addressPayload.landmark,
        addressPayload.city,
        addressPayload.state,
        addressPayload.postal_code,
        addressPayload.country,
        addressPayload.latitude,
        addressPayload.longitude,
        addressPayload.place_id,
        addressPayload.formatted_address,
        addressPayload.instructions,
        is_default || total === 0 ? 1 : 0,
      ]
    );

    const [inserted] = await pool.query('SELECT * FROM user_addresses WHERE id = ?', [result.insertId]);
    res.status(201).json(formatAddressResponse(inserted[0]));
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: error.message || 'Unable to save address' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const addressPayload = sanitizeAddressPayload({ ...req.body });
    const { is_default } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await pool.query(
      `UPDATE user_addresses SET 
        label = ?, address_line = ?, landmark = ?, city = ?, state = ?, postal_code = ?, country = ?,
        latitude = ?, longitude = ?, place_id = ?, formatted_address = ?, instructions = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        addressPayload.label,
        addressPayload.address_line,
        addressPayload.landmark,
        addressPayload.city,
        addressPayload.state,
        addressPayload.postal_code,
        addressPayload.country,
        addressPayload.latitude,
        addressPayload.longitude,
        addressPayload.place_id,
        addressPayload.formatted_address,
        addressPayload.instructions,
        is_default ? 1 : existing[0].is_default,
        req.params.id,
        req.user.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM user_addresses WHERE id = ?', [req.params.id]);
    res.json(formatAddressResponse(updated[0]));
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: error.message || 'Unable to update address' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await pool.query('DELETE FROM user_addresses WHERE id = ?', [req.params.id]);

    if (existing[0].is_default) {
      const [nextDefault] = await pool.query(
        'SELECT id FROM user_addresses WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [req.user.id]
      );
      if (nextDefault.length) {
        await pool.query('UPDATE user_addresses SET is_default = 1 WHERE id = ?', [nextDefault[0].id]);
      }
    }

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Unable to delete address' });
  }
});

router.post('/:id/default', async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await pool.query('UPDATE user_addresses SET is_default = 1 WHERE id = ?', [req.params.id]);

    res.json({ message: 'Default address updated' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ message: 'Unable to update default address' });
  }
});

module.exports = router;


