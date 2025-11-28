const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const STORE_COORDS = {
  latitude: 12.96762,
  longitude: 80.15031,
  formatted_address: 'Pallavaram Saravana Stores, Chennai',
  label: 'Kitchen Hub',
};

const formatAddress = (record) => ({
  id: record.id,
  label: record.label,
  formatted_address: record.formatted_address || record.address_line,
  latitude: Number(record.latitude),
  longitude: Number(record.longitude),
  city: record.city,
  state: record.state,
  postal_code: record.postal_code,
  country: record.country,
});

router.get('/route', authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.query;
    let query = 'SELECT * FROM user_addresses WHERE user_id = ?';
    const params = [req.user.id];

    if (addressId) {
      query += ' AND id = ?';
      params.push(addressId);
    }

    query += ' ORDER BY is_default DESC, updated_at DESC LIMIT 1';

    const [rows] = await pool.query(query, params);

    if (!rows.length) {
      return res.status(404).json({ message: 'No address available for route' });
    }

    const destination = formatAddress(rows[0]);
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${STORE_COORDS.longitude},${STORE_COORDS.latitude};${destination.longitude},${destination.latitude}`;

    let routeCoordinates = [
      { lat: STORE_COORDS.latitude, lng: STORE_COORDS.longitude },
      { lat: destination.latitude, lng: destination.longitude },
    ];
    let etaMinutes = 18;
    let distanceKm = 6;

    try {
      const { data } = await axios.get(osrmUrl, {
        params: { steps: false, overview: 'full', geometries: 'geojson' },
      });

      if (data?.routes?.length) {
        const bestRoute = data.routes[0];
        routeCoordinates = bestRoute.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
        etaMinutes = Math.max(5, Math.round(bestRoute.duration / 60));
        distanceKm = Number((bestRoute.distance / 1000).toFixed(1));
      }
    } catch (mapError) {
      console.warn('OSRM route fallback:', mapError.message);
    }

    res.json({
      source: STORE_COORDS,
      destination,
      path: routeCoordinates,
      etaMinutes,
      distanceKm,
    });
  } catch (error) {
    console.error('Delivery route error:', error);
    res.status(500).json({ message: 'Unable to fetch delivery route' });
  }
});

module.exports = router;


