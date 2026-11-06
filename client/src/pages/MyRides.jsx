
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./MyRides.css";

function MyRides() {
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("goxToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await API.get("/rides/my", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const rideData = Array.isArray(response.data)
          ? response.data
          : response.data.rides || [];

        setRides(rideData);

      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your rides. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [navigate]);

  return (
    <div className="my-rides-page">

      <nav className="my-rides-navbar">
        <h2 onClick={() => navigate("/home")}>
          Go<span>X</span>
        </h2>

        <a href="/home">Home</a>
      </nav>

      <div className="my-rides-container">

        <h1>My Rides</h1>

        <p className="my-rides-subtitle">
          View your previous ride bookings.
        </p>

        {loading && (
          <p>Loading your rides...</p>
        )}

        {error && (
          <p className="my-rides-error">{error}</p>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="no-rides">
            <h2>No rides yet!</h2>
            <p>Your booked rides will appear here.</p>

            <a href="/ride">Book a Ride</a>
          </div>
        )}

        {!loading && rides.map((ride) => (
          <div className="ride-history-card" key={ride._id}>

            <div className="ride-history-top">
              <h3>
                {ride.rideType} Ride
              </h3>

              <span>{ride.status}</span>
            </div>

            <p>
              <strong>Pickup:</strong> {ride.pickup}
            </p>

            <p>
              <strong>Destination:</strong> {ride.destination}
            </p>

            <p>
              <strong>Distance:</strong> {ride.estimatedDistance} km
            </p>

            <p>
              <strong>Fare:</strong> ₹{ride.fare}
            </p>

            <p className="ride-date">
              {new Date(ride.createdAt).toLocaleString("en-IN")}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}

export default MyRides;
