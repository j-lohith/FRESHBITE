import React, { useEffect, useState } from 'react';
import LocationPicker from '../location/LocationPicker';
import './AddressManager.css';

const DEFAULT_FORM = {
  label: 'home',
  address_line: '',
  landmark: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  instructions: '',
};

const AddressForm = ({ initialValue, onSubmit, onCancel }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [locationMeta, setLocationMeta] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialValue) {
      setForm({
        label: initialValue.label || 'home',
        address_line: initialValue.address_line || initialValue.formatted_address || '',
        landmark: initialValue.landmark || '',
        city: initialValue.city || '',
        state: initialValue.state || '',
        postal_code: initialValue.postal_code || '',
        country: initialValue.country || '',
        instructions: initialValue.instructions || '',
      });
      setLocationMeta({
        latitude: initialValue.latitude,
        longitude: initialValue.longitude,
        formatted_address: initialValue.formatted_address || initialValue.address_line,
      });
    }
  }, [initialValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationResolved = (meta) => {
    setLocationMeta(meta);
    if (meta?.formatted_address) {
      setForm((prev) => ({ ...prev, address_line: meta.formatted_address }));
    }
    if (meta?.city || meta?.state) {
      setForm((prev) => ({
        ...prev,
        city: meta.city || prev.city,
        state: meta.state || prev.state,
        postal_code: meta.postal_code || prev.postal_code,
        country: meta.country || prev.country,
      }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!locationMeta?.latitude || !locationMeta?.longitude) {
      setError('Please pin your exact location on the map.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        ...locationMeta,
        label: form.label || 'home',
        formatted_address: form.address_line || locationMeta.formatted_address,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="address-form" onSubmit={submit}>
      <div className="address-form__grid">
        <div className="address-form__field">
          <label htmlFor="label">Address Label</label>
          <select id="label" name="label" value={form.label} onChange={handleChange}>
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="primary">Primary</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="address-form__field">
          <label htmlFor="landmark">Landmark</label>
          <input
            id="landmark"
            name="landmark"
            value={form.landmark}
            onChange={handleChange}
            placeholder="Opposite to park, near signal, etc."
          />
        </div>
      </div>

      <div className="address-form__field">
        <label htmlFor="address_line">Full Address</label>
        <textarea
          id="address_line"
          name="address_line"
          value={form.address_line}
          onChange={handleChange}
          placeholder="Flat, Street, Area"
          rows={2}
        />
      </div>

      <div className="address-form__grid">
        <div className="address-form__field">
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city} onChange={handleChange} />
        </div>
        <div className="address-form__field">
          <label htmlFor="state">State</label>
          <input id="state" name="state" value={form.state} onChange={handleChange} />
        </div>
      </div>

      <div className="address-form__grid">
        <div className="address-form__field">
          <label htmlFor="postal_code">Postal Code</label>
          <input id="postal_code" name="postal_code" value={form.postal_code} onChange={handleChange} />
        </div>
        <div className="address-form__field">
          <label htmlFor="country">Country</label>
          <input id="country" name="country" value={form.country} onChange={handleChange} />
        </div>
      </div>

      <div className="address-form__field">
        <label htmlFor="instructions">Delivery Instructions (Optional)</label>
        <textarea
          id="instructions"
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <LocationPicker
        title="Fine tune on map"
        initialValue={
          locationMeta?.latitude
            ? { lat: locationMeta.latitude, lng: locationMeta.longitude }
            : undefined
        }
        onLocationResolved={handleLocationResolved}
        height={240}
      />

      {error && <p className="address-form__error">{error}</p>}

      <div className="address-form__actions">
        <button type="button" className="address-form__button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="address-form__button primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save address'}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;


