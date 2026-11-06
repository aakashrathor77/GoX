
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./MyOrders.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [ratingSelections, setRatingSelections] = useState({});
  const [reviewTexts, setReviewTexts] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("goxToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.get("/orders/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingOrderId(orderId);

      const token = localStorage.getItem("goxToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.patch(
        `/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(
        response.data.message || "Order cancelled successfully!"
      );

      await fetchOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to cancel order. Please try again."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleRatingSelect = (orderId, rating) => {
    setRatingSelections((previous) => ({
      ...previous,
      [orderId]: rating
    }));
  };

  const handleReviewChange = (orderId, value) => {
    setReviewTexts((previous) => ({
      ...previous,
      [orderId]: value
    }));
  };

  const handleReviewSubmit = async (orderId) => {
    const rating = ratingSelections[orderId];
    const review = reviewTexts[orderId]?.trim() || "";

    if (!rating) {
      alert("Please select a star rating.");
      return;
    }

    if (review.length < 3) {
      alert("Please write at least 3 characters in your review.");
      return;
    }

    try {
      setSubmittingReviewId(orderId);

      const token = localStorage.getItem("goxToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await API.patch(
        `/orders/${orderId}/review`,
        { rating, review },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(
        response.data.message || "Thank you for your review!"
      );

      await fetchOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const trackingSteps = [
    {
      title: "Order Placed",
      description: "Your order has been received",
      icon: "✓"
    },
    {
      title: "Preparing",
      description: "Restaurant is preparing your food",
      icon: "🍳"
    },
    {
      title: "Out for Delivery",
      description: "Your order is on its way",
      icon: "🛵"
    },
    {
      title: "Delivered",
      description: "Enjoy your delicious meal!",
      icon: "✓"
    }
  ];

  const getTrackingStep = (status) => {
    const value = status?.toLowerCase().trim();

    if (value === "delivered") return 3;
    if (value === "out for delivery") return 2;
    if (value === "preparing") return 1;

    return 0;
  };

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "delivered") return "status-delivered";
    if (value === "cancelled") return "status-cancelled";
    if (value === "confirmed") return "status-confirmed";
    if (value === "pending" || value === "placed") {
      return "status-pending";
    }
    if (value === "preparing") return "status-confirmed";
    if (value === "out for delivery") return "status-delivered";

    return "status-default";
  };

  const getTotalAmount = (order) => {
    if (order.totalAmount != null) {
      return order.totalAmount;
    }

    return order.items?.reduce(
      (total, item) =>
        total + (item.price || 0) * (item.quantity || 0),
      0
    ) || 0;
  };

  return (
    <div className="my-orders-page">
      <div className="orders-header">
        <button
          className="orders-back-btn"
          onClick={() => navigate("/home")}
        >
          ← Back to Home
        </button>

        <h1>My Orders</h1>

        <p>
          Track and manage your food orders with GoX.
        </p>

        <button
          className="refresh-orders-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      {loading ? (
        <div className="orders-message">
          <h2>Loading your orders...</h2>
          <p>Please wait while we fetch your order history.</p>
        </div>
      ) : error ? (
        <div className="orders-message">
          <h2>Something went wrong!</h2>
          <p>{error}</p>

          <button
            className="refresh-orders-btn"
            onClick={fetchOrders}
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">🛍️</div>

          <h2>No Orders Yet!</h2>

          <p>
            Your food orders will appear here once you place an order.
          </p>

          <button
            className="refresh-orders-btn"
            onClick={() => navigate("/food")}
          >
            Explore Food →
          </button>
        </div>
      ) : (
        <div className="orders-list">
          <div className="orders-count">
            <h2>Your Order History</h2>
            <span>{orders.length} Orders</span>
          </div>

          {orders.map((order) => {
            const currentStep = getTrackingStep(order.status);
            const isCancelled =
              order.status?.toLowerCase() === "cancelled";
            const isDelivered =
              order.status?.toLowerCase() === "delivered";
            const hasReviewed =
              order.rating !== null && order.rating !== undefined;

            return (
              <div className="order-card" key={order._id}>
                <div className="order-top">
                  <div>
                    <span className="order-label">
                      ORDER ID
                    </span>

                    <h3>
                      #{order._id.slice(-6).toUpperCase()}
                    </h3>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(order.status)}`}
                  >
                    {order.status || "Placed"}
                  </span>
                </div>

                <div className="order-date">
                  <span>Order Date</span>

                  <strong>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </strong>
                </div>

                {/* Order Tracking */}

                <div className="order-tracking">
                  <div className="tracking-heading">
                    <div>
                      <span className="tracking-label">
                        ORDER PROGRESS
                      </span>

                      <h3>Track Your Order</h3>
                    </div>

                    <span className="tracking-live">
                      ● Live Status
                    </span>
                  </div>

                  {isCancelled ? (
                    <div className="tracking-cancelled">
                      <span>✕</span>

                      <div>
                        <strong>Order Cancelled</strong>
                        <p>This order has been cancelled.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="tracking-steps">
                      {trackingSteps.map((step, index) => {
                        const completed = index < currentStep;
                        const active = index === currentStep;

                        return (
                          <div
                            className={`tracking-step ${
                              completed ? "completed" : ""
                            } ${active ? "active" : ""}`}
                            key={step.title}
                          >
                            <div className="tracking-step-icon">
                              {completed || (index === 3 && active)
                                ? "✓"
                                : step.icon}
                            </div>

                            <div className="tracking-step-content">
                              <strong>{step.title}</strong>
                              <p>{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="tracking-note">
                    Status updates are shown after refreshing your orders.
                  </p>
                </div>

                {/* Ordered Items */}

                <div className="order-items">
                  <h4>Ordered Items</h4>

                  {order.items?.map((item, index) => (
                    <div className="order-item" key={index}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <span>
                        ₹{(item.price || 0) * (item.quantity || 0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-total">
                  <strong>Total Amount</strong>

                  <strong>
                    ₹{getTotalAmount(order)}
                  </strong>
                </div>

                {order.status === "Placed" && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingOrderId === order._id}
                  >
                    {cancellingOrderId === order._id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

                {/* Ratings and Reviews */}

                {isDelivered && (
                  <div className="order-review-section">
                    {hasReviewed ? (
                      <div className="submitted-review">
                        <div className="review-heading">
                          <div>
                            <span className="review-label">
                              YOUR FEEDBACK
                            </span>
                            <h3>Thank you for your review!</h3>
                          </div>

                          <span className="review-saved-badge">
                            ✓ Submitted
                          </span>
                        </div>

                        <div
                          className="review-stars-display"
                          aria-label={`${order.rating} out of 5 stars`}
                        >
                          {"★".repeat(order.rating)}
                          {"☆".repeat(5 - order.rating)}
                          <span>{order.rating}/5</span>
                        </div>

                        <p className="submitted-review-text">
                          {order.review}
                        </p>

                        {order.reviewedAt && (
                          <span className="review-date">
                            Reviewed on{" "}
                            {new Date(order.reviewedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="review-form">
                        <span className="review-label">
                          SHARE YOUR EXPERIENCE
                        </span>

                        <h3>How was your food?</h3>

                        <p className="review-description">
                          Rate your order and tell us about your experience.
                        </p>

                        <div
                          className="rating-stars"
                          role="group"
                          aria-label="Select your rating"
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className={`rating-star ${
                                star <= (ratingSelections[order._id] || 0)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRatingSelect(order._id, star)
                              }
                              aria-label={`${star} star${star > 1 ? "s" : ""}`}
                              aria-pressed={
                                ratingSelections[order._id] === star
                              }
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <textarea
                          className="review-textarea"
                          value={reviewTexts[order._id] || ""}
                          onChange={(event) =>
                            handleReviewChange(order._id, event.target.value)
                          }
                          placeholder="Write your review here..."
                          maxLength={500}
                          rows={4}
                        />

                        <div className="review-form-footer">
                          <span>
                            {(reviewTexts[order._id] || "").length}/500
                          </span>

                          <button
                            className="submit-review-btn"
                            onClick={() => handleReviewSubmit(order._id)}
                            disabled={submittingReviewId === order._id}
                          >
                            {submittingReviewId === order._id
                              ? "Submitting..."
                              : "Submit Review"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
