import React from "react";
import { Link } from "react-router-dom";
import "./Unauthorized401.css";

const Unauthorized401 = () => {
  return (
    <div className="unauth-container">
      <h1 className="unauth-title">401</h1>
      <p className="unauth-msg">You are not authorized to access this page.</p>

      <Link to="/login" className="unauth-btn">
        Go to Login
      </Link>
    </div>
  );
};

export default Unauthorized401;
