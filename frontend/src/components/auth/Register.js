import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import LocationPicker from "../location/LocationPicker";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    profile_picture: "",
  });
  const [addressForm, setAddressForm] = useState({
    label: "primary",
    address_line: "",
    landmark: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    instructions: "",
  });
  const [locationMeta, setLocationMeta] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationResolved = (meta) => {
    setLocationMeta(meta);
    if (meta?.formatted_address) {
      setAddressForm((prev) => ({
        ...prev,
        address_line: meta.formatted_address,
      }));
    }
    setAddressForm((prev) => ({
      ...prev,
      city: meta.city || prev.city,
      state: meta.state || prev.state,
      postal_code: meta.postal_code || prev.postal_code,
      country: meta.country || prev.country,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!locationMeta?.latitude || !locationMeta?.longitude) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please Enter your delivery location before signing up.",
      }));
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, profile_picture, ...registerData } = formData;

      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(registerData).forEach((key) => {
        formDataToSend.append(key, registerData[key]);
      });

      // Add profile picture file if selected
      const fileInput = document.getElementById("profile_picture");
      if (fileInput && fileInput.files[0]) {
        formDataToSend.append("profile_picture", fileInput.files[0]);
      }

      await api.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // // After registration, login the user
      // const loginResponse = await api.post("/auth/login", {
      //   email: registerData.email,
      //   password: registerData.password,
      // });

      // login(loginResponse.data.token, loginResponse.data.user);

      try {
        await api.post("/addresses", {
          ...addressForm,
          ...locationMeta,
          formatted_address:
            addressForm.address_line || locationMeta.formatted_address,
          is_default: true,
        });
      } catch (addressError) {
        console.error("Saving primary address failed", addressError);
      }
     alert("Account Created Successfully..")
      navigate("/login");
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
              placeholder="Choose a username"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_picture">Profile Picture (Optional)</label>
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({
                      ...formData,
                      profile_picture: reader.result,
                    });
                  };
                  reader.readAsDataURL(file);
                } else {
                  setFormData({ ...formData, profile_picture: "" });
                }
              }}
              style={{ padding: "0.5rem" }}
            />
            {formData.profile_picture && (
              <img
                src={formData.profile_picture}
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginTop: "0.5rem",
                }}
              />
            )}
          </div>

          <div className="location-section">
            <div className="location-section__header">
              <div>
                <label>Delivery Location *</label>
                {/* <p>Allow location or drag the pin to mark your primary drop-off point.</p> */}
              </div>
            </div>
            <LocationPicker
              initialValue={null}
              onLocationResolved={handleLocationResolved}
            />

            <div className="form-group">
              <label htmlFor="address_line">Full Address</label>
              <textarea
                id="address_line"
                name="address_line"
                rows={2}
                value={addressForm.address_line}
                onChange={handleAddressChange}
                placeholder="Apartment, Street, Area"
              />
            </div>

            <div className="address-inline-grid">
              <div className="form-group">
                <label htmlFor="landmark">Landmark</label>
                <input
                  id="landmark"
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={handleAddressChange}
                  placeholder="Opposite park, near gate, etc."
                />
              </div>
              <div className="form-group">
                <label htmlFor="postal_code">Postal Code</label>
                <input
                  id="postal_code"
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            <div className="address-inline-grid">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Delivery Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={addressForm.instructions}
                onChange={handleAddressChange}
                placeholder="Add instructions for the rider (optional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              placeholder="Create a password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
