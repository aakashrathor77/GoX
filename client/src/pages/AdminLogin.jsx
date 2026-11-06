
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/admin-login", formData);

      localStorage.setItem("goxToken", response.data.token);
      localStorage.setItem("goxUser", JSON.stringify(response.data.user));

      navigate("/admin-dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Admin login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-logo">Go<span>X</span></div>

        <div className="admin-icon">⚙</div>

        <h1>Admin Portal</h1>
        <p className="admin-subtitle">
          Sign in to manage your GoX platform
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter admin password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <div className="admin-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Login to Dashboard"}
          </button>
        </form>

        <Link to="/login" className="admin-back-link">
          ← Back to User Login
        </Link>

        <div className="admin-security">
          Protected Admin Access
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
