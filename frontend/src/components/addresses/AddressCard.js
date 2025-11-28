import React from 'react';
import { FiHome, FiBriefcase, FiMapPin, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import './AddressManager.css';

const ICON_MAP = {
  home: <FiHome />,
  work: <FiBriefcase />,
  primary: <FiStar />,
};

const getAddressIcon = (label) => {
  if (!label) return <FiMapPin />;
  const key = label.toLowerCase();
  return ICON_MAP[key] || <FiMapPin />;
};

const AddressCard = ({ address, onEdit, onDelete, onMakeDefault }) => {
  const isDefault = Boolean(address.is_default);

  return (
    <div className={`address-card ${isDefault ? 'address-card--default' : ''}`}>
      <div className="address-card__icon">{getAddressIcon(address.label)}</div>
      <div className="address-card__details">
        <div className="address-card__header">
          <div>
            <h4>
              {address.label || 'Saved address'}
              {isDefault && <span className="address-card__badge">Default</span>}
            </h4>
            <p>{address.formatted_address || address.address_line}</p>
            {address.landmark && <p className="address-card__landmark">Landmark: {address.landmark}</p>}
          </div>
        </div>
        <div className="address-card__actions">
          {!isDefault && (
            <button type="button" onClick={() => onMakeDefault(address.id)} className="address-card__button secondary">
              Set Default
            </button>
          )}
          <button type="button" onClick={() => onEdit(address)} className="address-card__button">
            <FiEdit2 /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(address.id)}
            className="address-card__button danger"
            disabled={isDefault && !onMakeDefault}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;


