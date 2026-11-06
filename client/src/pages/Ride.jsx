
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Ride.css";

function Ride() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("Bike");
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ridePrices = {
    Bike: 10,
    Auto: 15,
    Car: 20
  };

  const calculateFare = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!pickup.trim() || !destination.trim()) {
      setError("Please enter pickup and destination.");
      return;
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError("Pickup and destination cannot be the same.");
      return;
    }

    const estimatedDistance = 8;
    const calculatedFare = ridePrices[rideType] * estimatedDistance;

    setFare(calculatedFare);
  };

  const confirmRide = async () => {
    const token = localStorage.getItem("goxToken");

    if (!token) {
      setError("Please login to book your ride.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.post(
        "/rides",
        {
          pickup: pickup.trim(),
          destination: destination.trim(),
          rideType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFare(response.data.ride.fare);
      setMessage("Ride booked successfully!");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to book your ride. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ride-page">
      <nav className="ride-navbar">
        <h2 onClick={() => navigate("/home")}>
          Go<span>X</span>
        </h2>

        <div className="ride-nav-links">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/food")}>Food</button>
          <button onClick={() => navigate("/my-orders")}>My Orders</button>
          <button onClick={() => navigate("/my-rides")}>My Rides</button>
          <button onClick={() => navigate("/profile")}>My Profile</button>
        </div>
      </nav>

      <section className="ride-hero">
        <div className="ride-intro">
          <span className="ride-eyebrow">YOUR JOURNEY, OUR PRIORITY</span>

          <h1>
            Move Around
            <br />
            With <span>GoX.</span>
          </h1>

          <p>
            Book your ride in a few simple steps.
            Comfortable journeys start here.
          </p>
        </div>

        <div className="ride-booking-card">
          <h2>Book Your Ride</h2>
          <p>Enter your journey details below.</p>

          <form onSubmit={calculateFare}>
            <label>Pickup Location</label>
            <input
              type="text"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setFare(null);
                setMessage("");
              }}
            />

            <label>Destination</label>
            <input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setFare(null);
                setMessage("");
              }}
            />

            <label>Select Your Ride</label>

            <div className="ride-options">
              {["Bike", "Auto", "Car"].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={
                    rideType === type
                      ? "ride-option active"
                      : "ride-option"
                  }
                  onClick={() => {
                    setRideType(type);
                    setFare(null);
                    setMessage("");
                  }}
                >
                  <span>
                    {type === "Bike" ? "🏍️" : type === "Auto" ? "🛺" : "🚗"}
                  </span>
                  {type}
                </button>
              ))}
            </div>

            <button type="submit" className="calculate-ride-btn">
              Calculate Fare →
            </button>
          </form>

          {error && (
            <p style={{ color: "red", marginTop: "15px" }}>
              {error}
            </p>
          )}

          {message && (
            <div className="fare-result">
              <h3>{message}</h3>
              <p>Your ride details have been saved.</p>
            </div>
          )}

          {fare !== null && !message && (
            <div className="fare-result">
              <span>Estimated Fare</span>
              <h2>₹{fare}</h2>

              <p>
                {rideType} • Estimated 8 km journey
              </p>

              <small>
                Demo estimate only. Actual distance calculation will be added later.
              </small>

              <button
                type="button"
                className="calculate-ride-btn"
                onClick={confirmRide}
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm Ride →"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Ride;
