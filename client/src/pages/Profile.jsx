
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("goxToken");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = response.data;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await API.patch(
        "/profile",
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user;

      localStorage.setItem("goxUser", JSON.stringify({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }));

      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setPasswordSaving(true);

    try {
      const response = await API.patch(
        "/profile/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <nav className="profile-navbar">
        <h2 onClick={() => navigate("/home")}>
          Go<span>X</span>
        </h2>

        <button onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </nav>

      <div className="profile-container">
        <div className="profile-card">
          <h1>My Profile</h1>

          <p className="profile-subtitle">
            Manage your GoX account information
          </p>

          {message && (
            <p className="profile-success">{message}</p>
          )}

          {error && (
            <p className="profile-error">{error}</p>
          )}

          <form onSubmit={handleSave} className="profile-form">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled
            />

            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

            <label>Address</label>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="3"
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <div className="profile-password-section">
            <h2>Change Password</h2>

            <form onSubmit={handlePasswordChange}>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="8"
                required
              />

              <button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
