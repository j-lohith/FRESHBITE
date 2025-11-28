import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiTruck, FiMapPin, FiCheckCircle } from "react-icons/fi";
import api from "../../utils/axios";
import DeliveryMapTracking from "../delivery/DeliveryMapTracking";
import "./DeliveryTracking.css";

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const statuses = [
    { key: "pending", label: "Order Placed", icon: <FiPackage /> },
    { key: "packed", label: "Order Packed", icon: <FiPackage /> },
    { key: "on_the_way", label: "On the Way", icon: <FiTruck /> },
    { key: "arriving", label: "Arriving Soon", icon: <FiMapPin /> },
    { key: "delivered", label: "Delivered", icon: <FiCheckCircle /> },
  ];

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      updateStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (order?.address_id) {
      fetchRoute(order.address_id);
    } else {
      setRouteInfo(null);
    }
  }, [order?.address_id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setCurrentStatus(response.data.status);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setLoading(false);
    }
  };

  const fetchRoute = async (addressId) => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const params = addressId ? { addressId } : undefined;
      const response = await api.get("/delivery/route", { params });
      setRouteInfo(response.data);
    } catch (error) {
      console.error("Route fetch error:", error);
      setRouteError("Unable to load live delivery route.");
    } finally {
      setRouteLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!order || order.status === "delivered") return;

    const statusOrder = [
      "pending",
      "packed",
      "on_the_way",
      "arriving",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      setCurrentStatus(nextStatus);

      try {
        await api.put(`/orders/${orderId}/status`, { status: nextStatus });
        fetchOrder();
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-error">
        <h2>Order not found</h2>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="delivery-tracking"
    >
      <div className="tracking-container">
         <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1 className="tracking-title">Track Your Order</h1>
        <div className="order-info-card">
          <h2>Order #{order.id}</h2>
          <p>Total: ₹{parseFloat(order.total_amount).toFixed(2)}</p>
          <p>Placed on: {new Date(order.created_at).toLocaleString()}</p>
          {order.address_formatted && (
            <p className="order-address-line">
              Delivering to: {order.address_label || "Primary"} — {order.address_formatted}
            </p>
          )}
        </div>

        {routeLoading && (
          <div className="tracking-loading">
            <div className="loading-spinner"></div>
            <p>Mapping your rider...</p>
          </div>
        )}
        {routeError && <div className="tracking-error">{routeError}</div>}
        {routeInfo && (
          <DeliveryMapTracking route={routeInfo} status={currentStatus} etaMinutes={routeInfo.etaMinutes} />
        )}

        <div className="status-timeline">
          {statuses.map((status, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <motion.div
                key={status.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`status-step ${isActive ? "active" : ""} ${
                  isCurrent ? "current" : ""
                }`}
              >
                <div className="status-icon-wrapper">
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="status-icon"
                  >
                    {status.icon}
                  </motion.div>
                  {isActive && index < statuses.length - 1 && (
                    <div className="status-line"></div>
                  )}
                </div>
                <div className="status-label">{status.label}</div>
              </motion.div>
            );
          })}
        </div>

        {currentStatus === "delivered" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="delivery-animation"
          >
            <div className="delivered-animation">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="success-icon"
              >
                ✓
              </motion.div>
              <h2>Order Delivered Successfully!</h2>
            </div>
          </motion.div>
        )}

        <div className="order-items">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items &&
              order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="order-item"
                >
                  <img src={item.image_url} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="view-orders-btn"
        >
          View All Orders
        </button>
      </div>
    </motion.div>
  );
};

export default DeliveryTracking;
