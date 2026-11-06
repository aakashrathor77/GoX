
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Food.css";

const foods = [
  { name: "Cheese Pizza", price: 199, category: "PIZZA", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600" },
  { name: "Classic Burger", price: 99, category: "BURGER", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
  { name: "Delicious Pasta", price: 149, category: "PASTA", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600" },
  { name: "Fresh Salad", price: 129, category: "SALAD", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600" },
  { name: "Tasty Sandwich", price: 119, category: "SANDWICH", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600" },
  { name: "Delicious Biryani", price: 179, category: "BIRYANI", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600" },
  { name: "Veg Momos", price: 89, category: "MOMOS", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600" },
  { name: "French Fries", price: 79, category: "SNACKS", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600" },
  { name: "Masala Dosa", price: 119, category: "SOUTH INDIAN", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600" },
  { name: "Chow Mein", price: 129, category: "NOODLES", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600" },
  { name: "Paneer Tikka", price: 189, category: "STARTER", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600" },
  { name: "Chocolate Cake", price: 149, category: "DESSERT", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600" },
  { name: "Ice Cream", price: 69, category: "DESSERT", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600" },
  { name: "Veg Thali", price: 159, category: "INDIAN MEAL", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600" },
  { name: "Veg Spring Roll", price: 109, category: "STARTER", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
];

function Food() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalAmount = totalPrice - discountAmount;

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const addToCart = (food) => {
    const token = localStorage.getItem("goxToken");

    if (!token) {
      navigate("/login", { state: { from: "/food" } });
      return;
    }

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.name === food.name
      );

      if (existing) {
        return previousCart.map((item) =>
          item.name === food.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...food, quantity: 1 }];
    });

    clearCoupon();
    setOrderPlaced(false);
    setOrderError("");
  };

  const updateQuantity = (name, change) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    clearCoupon();
    setOrderError("");
  };

  const handleCustomerChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!cart.length) {
      setCouponError("Your cart is empty");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const token = localStorage.getItem("goxToken");

      const response = await API.post(
        "/orders/validate-coupon",
        {
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
          couponCode: couponInput.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppliedCoupon({
        code: response.data.couponCode,
        discountAmount: response.data.discountAmount,
      });

      setCouponInput(response.data.couponCode);
      setCouponError("");

    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(
        error.response?.data?.message ||
        "Unable to apply coupon. Please try again."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!cart.length || placingOrder) return;

    try {
      setPlacingOrder(true);
      setOrderError("");

      const token = localStorage.getItem("goxToken");

      if (!token) {
        navigate("/login", { state: { from: "/food" } });
        return;
      }

      const response = await API.post(
        "/orders",
        {
          customer,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
          couponCode: appliedCoupon?.code || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setOrderPlaced(true);
        setCart([]);
        setShowCheckout(false);
        clearCoupon();

        setCustomer({
          name: "",
          phone: "",
          address: "",
        });

        setTimeout(() => {
          document.getElementById("order-success")?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      }
    } catch (error) {
      setOrderError(
        error.response?.data?.message ||
        "Unable to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="food-page">

      <nav className="food-navbar">
        <Link to="/home" className="food-logo">
          GoX<span>.</span>
        </Link>

        <div className="food-nav-actions">
          <Link to="/home" className="back-home">
            Back to Home
          </Link>

          <Link to="/my-orders" className="back-home">
            My Orders
          </Link>

          <Link to="/my-rides" className="back-home">
            My Rides
          </Link>

          <Link to="/profile" className="back-home">
            My Profile
          </Link>

          <a href="#cart" className="cart-count">
            Cart ({totalItems})
          </a>
        </div>
      </nav>

      <section className="food-hero">
        <div>
          <p>GOX FOOD DELIVERY</p>
          <h1>Delicious Food, Delivered Fast!</h1>
          <span>Your favourite meals are just one click away.</span>
        </div>
      </section>

      <section className="food-menu">
        <div className="food-section-heading">
          <p>EXPLORE OUR MENU</p>
          <h2>Popular Dishes</h2>
          <span>Choose your favourite food and enjoy!</span>
        </div>

        <div className="food-grid">
          {foods.map((food) => (
            <div className="food-card" key={food.name}>
              <img
                src={food.image}
                alt={food.name}
                className="food-card-image"
              />

              <div className="food-card-content">
                <span className="food-category">
                  {food.category}
                </span>

                <h3>{food.name}</h3>

                <div className="food-card-bottom">
                  <strong>₹{food.price}</strong>

                  <button
                    className="add-btn"
                    onClick={() => addToCart(food)}
                  >
                    Add +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="food-cart" id="cart">
        <h2>Your Shopping Cart</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">
            Your cart is empty. Add some delicious food!
          </p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.name}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>₹{item.price} × {item.quantity}</p>
                  </div>

                  <div className="quantity-actions">
                    <button
                      onClick={() => updateQuantity(item.name, -1)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.name, 1)}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h3>Total: ₹{totalPrice}</h3>

              <button
                className="checkout-btn"
                onClick={() => {
                  setOrderError("");
                  setShowCheckout(true);
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </section>

      {showCheckout && (
        <section className="food-checkout">
          <h2>Checkout Details</h2>

          <form onSubmit={placeOrder}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={customer.name}
              onChange={handleCustomerChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={handleCustomerChange}
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />

            <textarea
              name="address"
              placeholder="Delivery Address"
              value={customer.address}
              onChange={handleCustomerChange}
              required
            />

            <div className="coupon-box">
              <h3>Have a Coupon Code?</h3>

              <div className="coupon-input-row">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setAppliedCoupon(null);
                    setCouponError("");
                  }}
                  disabled={couponLoading || !!appliedCoupon}
                />

                {appliedCoupon ? (
                  <button
                    type="button"
                    className="remove-coupon-btn"
                    onClick={clearCoupon}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="apply-coupon-btn"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="coupon-error">{couponError}</p>
              )}

              {appliedCoupon && (
                <p className="coupon-success">
                  ✓ {appliedCoupon.code} applied successfully!
                </p>
              )}

              <div className="available-coupons">
                <p>Available Offers:</p>
                <span>WELCOME10 – 10% OFF on ₹199+</span>
                <span>GOX20 – 20% OFF on ₹399+</span>
              </div>
            </div>

            <div className="checkout-summary">
              <div>
                <span>Subtotal</span>
                <strong>₹{totalPrice}</strong>
              </div>

              <div>
                <span>Coupon Discount</span>
                <strong className="discount-value">
                  - ₹{discountAmount}
                </strong>
              </div>

              <div className="summary-final">
                <span>Amount to Pay</span>
                <strong>₹{finalAmount}</strong>
              </div>
            </div>

            {orderError && (
              <p style={{ color: "red" }}>
                {orderError}
              </p>
            )}

            <button
              type="submit"
              className="checkout-btn"
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowCheckout(false);
                setOrderError("");
              }}
            >
              Cancel
            </button>
          </form>
        </section>
      )}

      {orderPlaced && (
        <section className="order-success" id="order-success">
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for ordering with GoX.</p>
          <Link to="/home">Back to Home</Link>
        </section>
      )}

      <footer className="food-footer">
        <h3>GoX.</h3>
        <p>Your everyday partner for food and rides.</p>
        <p>© 2026 GoX. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Food;
