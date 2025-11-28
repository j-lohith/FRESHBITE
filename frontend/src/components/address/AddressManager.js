import React, { useMemo, useState } from 'react';
import { FiPlus, FiXCircle } from 'react-icons/fi';
import { useAddresses } from '../../context/AddressContext';
import LocationPicker from '../location/LocationPicker';
import AddressCard from './AddressCard';
import './AddressManager.css';

const LABEL_OPTIONS = ['Primary', 'Home', 'Work', 'Other'];

const emptyForm = {
  label: 'Home',
  landmark: '',
  instructions: '',
  is_default: false,
};

const AddressManager = () => {
  const { addresses, primaryAddress, loading, saveAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddresses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeAddressCount = addresses.length;
  const canAddMore = activeAddressCount < 5;

  const sortedAddresses = useMemo(() => {
    const rest = addresses.filter((addr) => !addr.is_default);
    return primaryAddress ? [primaryAddress, ...rest.filter((addr) => addr.id !== primaryAddress.id)] : rest;
  }, [addresses, primaryAddress]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setForm(emptyForm);
    setLocation(null);
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      is_default: !primaryAddress,
      label: primaryAddress ? 'Home' : 'Primary',
    });
    setLocation(primaryAddress || null);
    setIsFormOpen(true);
  };

  const openEdit = (address) => {
    setEditingAddress(address);

    setForm({
      label: address.label,
      landmark: address.landmark || '',
      instructions: address.instructions || '',
      is_default: address.is_default,
    });

    setLocation({
      ...address,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!location?.latitude || !location?.longitude) {
      alert('Please pin your delivery location on the map.');
      return;
    }
    setSubmitting(true);
    const payload = {
      label: form.label,
      landmark: form.landmark,
      instructions: form.instructions,
      is_default: form.is_default,
      address_line: location.address_line || location.formatted_address,
      formatted_address: location.formatted_address,
      city: location.city,
      state: location.state,
      postal_code: location.postal_code,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.place_id,
    };

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
      } else {
        await saveAddress(payload);
      }
      closeForm();
    } catch (error) {
      console.error('Address save failed', error);
      alert(error.response?.data?.message || 'Unable to save address right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="address-manager">
      <div className="address-manager__header">
        <div>
          <h3>Saved Addresses</h3>
          <p>Keep your delivery spots ready. You can store up to five addresses.</p>
        </div>
        <button
          type="button"
          className="address-manager__add-btn"
          onClick={openCreate}
          disabled={!canAddMore}
        >
          <FiPlus /> Add Address
        </button>
      </div>

      {!canAddMore && <p className="address-manager__limit">You have reached the maximum of 5 saved addresses.</p>}

      {loading ? (
        <div className="address-manager__loader">Loading saved addresses...</div>
      ) : (
        <div className="address-manager__grid">
          {sortedAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onDelete={deleteAddress}
              onSetDefault={setDefaultAddress}
            />
          ))}
          {!addresses.length && <p className="address-manager__empty">No addresses saved yet.</p>}
        </div>
      )}

      {isFormOpen && (
        <div className="address-manager__drawer">
          <div className="address-form">
            <div className="address-form__header">
              <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
              <button type="button" onClick={closeForm}>
                <FiXCircle />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="address-form__row">
                <label>
                  Label
                  <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
                    {LABEL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="address-form__checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  />
                  Set as default
                </label>
              </div>

              <label>
                Landmark / Building name
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Block, floor, apartment number"
                />
              </label>

              <label>
                Delivery instructions
                <textarea
                  rows={3}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Add instructions for the rider"
                />
              </label>

              <LocationPicker value={location} onChange={setLocation} />

              <div className="address-form__actions">
                <button type="button" className="address-form__cancel" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="address-form__submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;


