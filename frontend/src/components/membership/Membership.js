import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiAward, FiStar, FiZap } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import "./Membership.css";

const Membership = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [benefits, setBenefits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMembership();
    fetchBenefits();
  }, [user]);

  const fetchMembership = async () => {
    try {
      const response = await api.get("/membership");
      setMembership(response.data);
    } catch (error) {
      console.error("Error fetching membership:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      const response = await api.get("/membership/benefits");
      setBenefits(response.data);
    } catch (error) {
      console.error("Error fetching benefits:", error);
    }
  };

  const handleUpgrade = async (type) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const benefit = benefits[type];
      const amount = benefit.price;

      // Create Razorpay order
      const paymentResponse = await api.post("/payment/create-order", {
        amount: amount,
        currency: "INR",
      });

      // Load Razorpay script if not already loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve();
            return;
          }

          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Razorpay script"));
          document.body.appendChild(script);
        });
      };

      try {
        await loadRazorpayScript();

        // Get Razorpay key from environment or use test key
        const keyResponse = await api.get("/payment/key");
        const razorpayKey = keyResponse.data.key;
        if (!razorpayKey) {
          console.warn("Razorpay key not found in environment variables");
        }

        const options = {
          key: razorpayKey || "rzp_test_1234567890",
          amount: paymentResponse.data.amount,
          currency: paymentResponse.data.currency,
          name: "FreshBite",
          description: `${benefit.name} Membership`,
          order_id: paymentResponse.data.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verifyResponse = await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.data.success) {
                // Activate membership after successful payment
                await api.post("/membership/upgrade", { membership_type: type });
                alert("Membership upgraded successfully!");
                fetchMembership();
              } else {
                alert("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              alert("Payment verification failed");
            }
          },
          prefill: {
            name: (user.first_name || "") + " " + (user.last_name || ""),
            email: user.email,
            contact: user.phone || "",
          },
          theme: {
            color: "#667eea",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", (response) => {
          alert("Payment failed. Please try again.");
        });
        razorpay.open();
      } catch (scriptError) {
        console.error("Error loading Razorpay:", scriptError);
        alert("Payment gateway not available. Please try again later.");
      }
    } catch (error) {
      console.error("Error upgrading membership:", error);
      alert("Failed to initiate payment");
    }
  };

  if (loading || !benefits) {
    return <div className="membership-loading">Loading...</div>;
  }

  const membershipTypes = [
    { key: "bronze", icon: <FiAward />, color: "#cd7f32" },
    { key: "silver", icon: <FiStar />, color: "#c0c0c0" },
    { key: "gold", icon: <FiZap />, color: "#ffd700" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="membership-page"
    >
      <div className="membership-container">
        
        <h1 className="membership-title">Choose Your Membership</h1>
        <p className="membership-subtitle">
          Unlock exclusive benefits and savings
        </p>

        {membership && membership.is_active && (
          <div className="current-membership-banner">
            <FiZap />
            <span>
              You are currently a{" "}
              <strong>{membership.membership_type.toUpperCase()}</strong> member
            </span>
          </div>
        )}

        <div className="membership-cards">
          {Object.entries(benefits).map(([key, benefit], index) => {
            const type = membershipTypes[index];
            const isCurrent = membership && membership.membership_type === key;
            const isUpgraded =
              membership &&
              ["bronze", "silver", "gold"].indexOf(
                membership.membership_type
              ) >= ["bronze", "silver", "gold"].indexOf(key);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`membership-card ${
                  isCurrent ? "current" : ""
                } ${key}`}
              >
                <div
                  className="membership-header"
                  style={{
                    background: `linear-gradient(135deg, ${type.color}20 0%, ${type.color}40 100%)`,
                  }}
                >
                  
                  <div
                    className="membership-icon"
                    style={{ color: type.color }}
                  >
                    {type.icon}
                  </div>
                  <h2 className="membership-name">{benefit.name}</h2>
                  <div className="membership-price">
                    <span className="price-amount">₹{benefit.price}</span>
                    <span className="price-period">/year</span>
                  </div>
                </div>
                <div className="membership-body">
                  <ul className="benefits-list">
                    {benefit.benefits.map((item, idx) => (
                      <li key={idx}>
                        <FiCheck className="check-icon" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="membership-footer">
                  <button
                    onClick={() => handleUpgrade(key)}
                    className={`upgrade-button ${isCurrent ? "current" : ""}`}
                    style={{
                      background: isCurrent
                        ? "#48bb78"
                        : `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                    }}
                    disabled={isCurrent}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : isUpgraded
                      ? "Downgrade"
                      : "Upgrade Now"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Membership;
