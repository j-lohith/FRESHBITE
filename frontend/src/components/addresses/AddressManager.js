import React, { useMemo, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { useAddresses } from '../../context/AddressContext';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import './AddressManager.css';

const AddressManager = () => {
  const {
    addresses,
    primaryAddress,
    loadingAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const orderedAddresses = useMemo(() => {
    if (!addresses?.length) {
      return [];
    }
    return [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  }, [addresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, { ...payload, is_default: editingAddress.is_default });
    } else {
      await addAddress({ ...payload, is_default: !addresses.length });
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this address?')) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="address-manager">
      <div className="address-manager__header">
        <div>
          <h3>Saved Addresses</h3>
          <p>Set your home, work, and other favourite spots for faster checkout.</p>
        </div>
        <button type="button" className="address-manager__add" onClick={handleAddNew} disabled={addresses.length >= 5}>
          <FiPlusCircle />
          Add address
        </button>
      </div>

      {loadingAddresses && <div className="address-manager__loading">Fetching your addresses...</div>}

      {!loadingAddresses && !addresses.length && (
        <div className="address-manager__empty">
          <p>You haven&apos;t saved any delivery locations yet.</p>
          <button type="button" onClick={handleAddNew}>
            Add your first address
          </button>
        </div>
      )}

      {!showForm && !!addresses.length && (
        <div className="address-manager__list">
          {orderedAddresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMakeDefault={setDefaultAddress}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="address-manager__form">
          <AddressForm
            key={editingAddress?.id || 'new'}
            initialValue={editingAddress}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          />
        </div>
      )}

      {primaryAddress && !showForm && (
        <div className="address-manager__default">
          <p>
            Default delivery to <strong>{primaryAddress.label}</strong> — {primaryAddress.formatted_address}
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressManager;


