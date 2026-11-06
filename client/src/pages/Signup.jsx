
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/register", formData);

      localStorage.setItem("goxToken", response.data.token);
      localStorage.setItem(
        "goxUser",
        JSON.stringify(response.data.user)
      );

      navigate("/home", { replace: true });

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-brand">
          <span className="brand-icon">G</span>
          <span>GoX</span>
        </div>

        <div className="signup-heading">
          <span className="signup-tag">GET STARTED WITH GOX</span>
          <h1>Create your account</h1>
          <p>Join GoX and make your everyday journeys easier.</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password (8+ characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <span> →</span>}
          </button>

        </form>

        {message && (
          <p className="signup-message">{message}</p>
        )}

        <div className="signup-footer">
          Already have an account?
          <Link to="/login"> Log in</Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;
