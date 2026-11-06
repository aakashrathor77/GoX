
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("goxToken");
    localStorage.removeItem("goxUser");
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <a href="#home" className="logo" onClick={closeMenu}>
          Go<span>X</span>
        </a>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="gox-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          id="gox-navigation"
          className={`nav-links ${menuOpen ? "active" : ""}`}
        >
          <a href="#home" onClick={closeMenu}>Home</a>
          <Link to="/food" onClick={closeMenu}>Food</Link>
          <Link to="/ride" onClick={closeMenu}>Rides</Link>
          <Link to="/my-orders" onClick={closeMenu}>My Orders</Link>
          <Link to="/my-rides" onClick={closeMenu}>My Rides</Link>
          <Link to="/profile" onClick={closeMenu}>My Profile</Link>
          <a href="#about" onClick={closeMenu}>About</a>

          <button
            type="button"
            onClick={() => {
              closeMenu();
              handleLogout();
            }}
            className="mobile-logout"
          >
            Logout
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">YOUR EVERYDAY PARTNER</span>

          <h1>
            Life Gets Easier
            <br />
            With <span>GoX.</span>
          </h1>

          <p>
            Delicious food at your doorstep and comfortable
            rides at your fingertips. Everything you need,
            all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/food" className="primary-btn">
              Order Food →
            </Link>

            <Link to="/ride" className="secondary-btn">
              Book a Ride →
            </Link>
          </div>

          <div className="hero-trust">
            <span>✓ Easy Booking</span>
            <span>✓ Quick Service</span>
            <span>✓ Simple Experience</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle"></div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900"
              alt="Delicious pizza"
            />
          </div>

          <div className="floating-card food-float">
            <span className="float-icon">🍔</span>
            <div>
              <h4>Fresh Food</h4>
              <p>Delivered to your door</p>
            </div>
          </div>

          <div className="floating-card ride-float">
            <span className="float-icon">🚕</span>
            <div>
              <h4>Quick Rides</h4>
              <p>Reach your destination</p>
            </div>
          </div>

          <div className="hero-star">✦</div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="section-heading">
          <span className="eyebrow">WHAT WE OFFER</span>
          <h2>Everything You Need</h2>
          <p>Two essential services. One simple platform.</p>
        </div>

        <div className="service-container">
          <div className="service-card" id="food">
            <div className="service-image">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900"
                alt="Food delivery"
              />
              <span className="image-tag">FOOD DELIVERY</span>
            </div>

            <div className="service-content">
              <span className="service-number">01 / SERVICE</span>
              <h3>
                Good Food.
                <br />
                Great Moments.
              </h3>
              <p>
                Discover delicious meals and enjoy your
                favourite food delivered right to your doorstep.
              </p>
              <Link to="/food" className="service-link food-link">
                Explore Food →
              </Link>
            </div>
          </div>

          <div className="service-card" id="rides">
            <div className="service-image">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900"
                alt="Ride booking"
              />
              <span className="image-tag ride-tag">RIDE BOOKING</span>
            </div>

            <div className="service-content">
              <span className="service-number">02 / SERVICE</span>
              <h3>
                Your Journey.
                <br />
                Our Priority.
              </h3>
              <p>
                Book a comfortable ride and travel to your
                destination with convenience and ease.
              </p>
              <Link to="/ride" className="service-link ride-link">
                Book Your Ride →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="why-gox" id="about">
        <div className="why-heading">
          <span className="eyebrow">THE GOX ADVANTAGE</span>
          <h2>Why Choose GoX?</h2>
          <p>Making everyday life a little easier.</p>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Easy</h3>
            <p>Simple booking experience without complications.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>One Platform</h3>
            <p>Food delivery and ride booking in one place.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>User Friendly</h3>
            <p>A clean and easy experience for everyone.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#home" className="footer-logo">
              Go<span>X</span>
            </a>
            <p>
              Your everyday partner for food and rides.
              Making every journey and every meal easier.
            </p>
          </div>

          <div className="footer-links">
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <Link to="/food">Food Delivery</Link>
            <Link to="/ride">Ride Booking</Link>
            <Link to="/my-orders">My Orders</Link>
            <Link to="/my-rides">My Rides</Link>
            <Link to="/profile">My Profile</Link>
          </div>

          <div className="footer-links">
            <h4>Our Platform</h4>
            <a href="#services">Our Services</a>
            <a href="#about">About GoX</a>
            <Link to="/admin-login">Admin Login</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 GoX. All Rights Reserved.</p>
          <p>Made for everyday convenience.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
