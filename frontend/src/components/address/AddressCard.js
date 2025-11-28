import React from 'react';
import { FiMapPin, FiEdit2, FiTrash, FiStar } from 'react-icons/fi';
import './AddressManager.css';

const labelColors = {
  Primary: '#f97316',
  Home: '#3182ce',
  Work: '#805ad5',
  Other: '#2d3748',
};

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const chipColor = labelColors[address.label] || '#2d3748';

  return (
    <div className={`address-card ${address.is_default ? 'address-card--default' : ''}`}>
      <div className="address-card__header">
        <div className="address-card__title">
          <span className="address-card__icon">
            <FiMapPin />
          </span>
          <div>
            <p className="address-card__label" style={{ color: chipColor }}>
              {address.label}
            </p>
            {address.is_default && (
              <span className="address-card__default">
                <FiStar /> Default
              </span>
            )}
          </div>
        </div>
        <div className="address-card__actions">
          <button type="button" onClick={() => onEdit(address)}>
            <FiEdit2 /> Edit
          </button>
          <button type="button" onClick={() => onDelete(address.id)}>
            <FiTrash /> Delete
          </button>
        </div>
      </div>
      <p className="address-card__text">{address.formatted_address || address.address_line}</p>
      {address.landmark && <p className="address-card__landmark">Landmark: {address.landmark}</p>}
      {address.instructions && (
        <p className="address-card__instructions">Instructions: {address.instructions}</p>
      )}
      {!address.is_default && (
        <button className="address-card__default-btn" type="button" onClick={() => onSetDefault(address.id)}>
          Set as Default
        </button>
      )}
    </div>
  );
};

export default AddressCard;


