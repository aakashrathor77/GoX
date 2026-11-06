
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import API from "../api/axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRides: 0,
    totalFoodRevenue: 0,
    totalRideRevenue: 0,
    totalRevenue: 0,
    monthlyData: []
  });

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rides, setRides] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [rideSearch, setRideSearch] = useState("");

  const [orderFilter, setOrderFilter] = useState("All");
  const [rideFilter, setRideFilter] = useState("All");

  const token = localStorage.getItem("goxToken");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchDashboardData = async () => {
    try {
      setError("");

      const [statsRes, usersRes, ordersRes, ridesRes] =
        await Promise.all([
          API.get("/admin/stats", { headers }),
          API.get("/admin/users", { headers }),
          API.get("/admin/orders", { headers }),
          API.get("/admin/rides", { headers })
        ]);

      const statsData = statsRes.data.stats || statsRes.data;

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalOrders: statsData.totalOrders || 0,
        totalRides: statsData.totalRides || 0,
        totalFoodRevenue: statsData.totalFoodRevenue || 0,
        totalRideRevenue: statsData.totalRideRevenue || 0,
        totalRevenue: statsData.totalRevenue || 0,
        monthlyData: statsData.monthlyData || []
      });

      setUsers(
        Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || []
      );

      setOrders(
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data.orders || []
      );

      setRides(
        Array.isArray(ridesRes.data)
          ? ridesRes.data
          : ridesRes.data.rides || []
      );
    } catch (err) {
      console.error("Dashboard Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("goxToken");
        localStorage.removeItem("goxUser");
        navigate("/admin-login");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    fetchDashboardData();
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      await API.patch(
        `/admin/orders/${id}/status`,
        { status },
        { headers }
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === id ? { ...order, status } : order
        )
      );

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update order status."
      );
    }
  };

  const updateRideStatus = async (id, status) => {
    try {
      await API.patch(
        `/admin/rides/${id}/status`,
        { status },
        { headers }
      );

      setRides((previousRides) =>
        previousRides.map((ride) =>
          ride._id === id ? { ...ride, status } : ride
        )
      );

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update ride status."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("goxToken");
    localStorage.removeItem("goxUser");
    navigate("/admin-login");
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getOrderCustomer = (order) => {
    return (
      order.user?.name ||
      order.user?.fullName ||
      order.customer?.name ||
      order.customerName ||
      "Customer"
    );
  };

  const getRideCustomer = (ride) => {
    return (
      ride.user?.name ||
      ride.user?.fullName ||
      ride.customer?.name ||
      ride.customerName ||
      "Customer"
    );
  };

  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase();

    return (
      (user.name || user.fullName || "").toLowerCase().includes(search) ||
      (user.email || "").toLowerCase().includes(search)
    );
  });

  const filteredOrders = orders.filter((order) => {
    const customer = getOrderCustomer(order).toLowerCase();

    const items = Array.isArray(order.items)
      ? order.items.map((item) => item.name || item.title || "").join(" ")
      : "";

    const matchesSearch =
      customer.includes(orderSearch.toLowerCase()) ||
      items.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus =
      orderFilter === "All" || order.status === orderFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredRides = rides.filter((ride) => {
    const customer = getRideCustomer(ride).toLowerCase();
    const pickup = (ride.pickupLocation || ride.pickup || "").toLowerCase();

    const destination = (
      ride.dropLocation ||
      ride.destination ||
      ride.drop ||
      ""
    ).toLowerCase();

    const search = rideSearch.toLowerCase();

    const matchesSearch =
      customer.includes(search) ||
      pickup.includes(search) ||
      destination.includes(search);

    const matchesStatus =
      rideFilter === "All" || ride.status === rideFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">

      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          Go<span>X</span>
        </div>

        <div className="admin-panel-label">
          ADMIN PANEL
        </div>

        <nav>
          {["Overview", "Users", "Food Orders", "Rides"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Overview" && "▦ "}
              {tab === "Users" && "♙ "}
              {tab === "Food Orders" && "▣ "}
              {tab === "Rides" && "➜ "}
              {tab}
            </button>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="admin-main">

        <div className="admin-topbar">
          <div>
            <span className="admin-eyebrow">
              GOX MANAGEMENT SYSTEM
            </span>

            <h1>
              {activeTab === "Overview"
                ? "Dashboard Overview"
                : activeTab}
            </h1>

            <p>
              {activeTab === "Overview"
                ? "Welcome to GoX Administration"
                : `Manage GoX ${activeTab.toLowerCase()} from here`}
            </p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "↻ Refreshing..." : "↻ Refresh Data"}
          </button>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {activeTab === "Overview" && (
          <>
            <section className="admin-welcome-card">
              <div>
                <span>ADMIN CONTROL CENTER</span>
                <h2>Welcome to GoX Admin Panel!</h2>
                <p>
                  Manage customers, food orders and ride bookings
                  from one place.
                </p>
              </div>

              <div className="admin-welcome-icon">✦</div>
            </section>

            <h2 className="admin-section-title">
              Platform Overview
            </h2>

            <section className="admin-stats-grid">
              <div className="admin-stat-card blue">
                <div className="stat-icon">♙</div>
                <span>Total Users</span>
                <h2>{stats.totalUsers}</h2>
                <p>Registered customers</p>
              </div>

              <div className="admin-stat-card orange">
                <div className="stat-icon">▣</div>
                <span>Total Food Orders</span>
                <h2>{stats.totalOrders}</h2>
                <p>Orders placed on GoX</p>
              </div>

              <div className="admin-stat-card green">
                <div className="stat-icon">➜</div>
                <span>Total Rides</span>
                <h2>{stats.totalRides}</h2>
                <p>Ride bookings received</p>
              </div>
            </section>

            <h2 className="admin-section-title">
              Revenue Overview
            </h2>

            <section className="admin-revenue-grid">
              <div className="admin-revenue-card total">
                <span>Total Revenue</span>
                <h2>{formatCurrency(stats.totalRevenue)}</h2>
                <p>Combined completed revenue</p>
              </div>

              <div className="admin-revenue-card food">
                <span>Food Revenue</span>
                <h2>{formatCurrency(stats.totalFoodRevenue)}</h2>
                <p>Revenue from delivered orders</p>
              </div>

              <div className="admin-revenue-card ride">
                <span>Ride Revenue</span>
                <h2>{formatCurrency(stats.totalRideRevenue)}</h2>
                <p>Revenue from completed rides</p>
              </div>
            </section>

            <h2 className="admin-section-title">
              Revenue Analytics
            </h2>

            <section className="admin-chart-grid">

              <div className="admin-chart-card">
                <div className="admin-chart-heading">
                  <h3>Monthly Food Orders</h3>
                  <p>Food orders received each month</p>
                </div>

                <div className="admin-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="orders"
                        name="Food Orders"
                        fill="#2563eb"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="admin-chart-card">
                <div className="admin-chart-heading">
                  <h3>Monthly Ride Bookings</h3>
                  <p>Ride bookings received each month</p>
                </div>

                <div className="admin-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="rides"
                        name="Ride Bookings"
                        fill="#f59e0b"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="admin-chart-card admin-chart-wide">
                <div className="admin-chart-heading">
                  <h3>Monthly Revenue</h3>
                  <p>Food and ride revenue performance</p>
                </div>

                <div className="admin-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="foodRevenue"
                        name="Food Revenue"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="rideRevenue"
                        name="Ride Revenue"
                        stroke="#f59e0b"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </section>

            <section className="admin-quick-section">
              <h2>Quick Management</h2>
              <p>Quickly access different sections of your platform.</p>

              <div className="admin-quick-grid">
                <button onClick={() => setActiveTab("Users")}>
                  <span>♙</span>
                  <strong>Manage Users</strong>
                  <small>View registered customers</small>
                </button>

                <button onClick={() => setActiveTab("Food Orders")}>
                  <span>▣</span>
                  <strong>Manage Food Orders</strong>
                  <small>Track and update orders</small>
                </button>

                <button onClick={() => setActiveTab("Rides")}>
                  <span>➜</span>
                  <strong>Manage Rides</strong>
                  <small>Manage ride bookings</small>
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === "Users" && (
          <section className="admin-table-section">
            <div className="admin-table-heading">
              <div>
                <h2>Registered Users</h2>
                <p>View all customers registered on GoX.</p>
              </div>

              <div className="admin-filter-group">
                <input
                  type="text"
                  className="admin-search"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name || user.fullName || "N/A"}</td>
                        <td>{user.email || "N/A"}</td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="admin-empty">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "Food Orders" && (
          <section className="admin-table-section">
            <div className="admin-table-heading">
              <div>
                <h2>Food Orders Management</h2>
                <p>View and update customer food orders.</p>
              </div>

              <div className="admin-filter-group">
                <input
                  type="text"
                  className="admin-search"
                  placeholder="Search customer or item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />

                <select
                  className="admin-filter"
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Placed">Placed</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{getOrderCustomer(order)}</td>

                        <td>
                          {Array.isArray(order.items)
                            ? order.items.map((item) =>
                                `${item.name || item.title || "Item"} x${item.quantity || 1}`
                              ).join(", ")
                            : "N/A"}
                        </td>

                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.status || "Placed"}</td>

                        <td>
                          <select
                            className="admin-status-select"
                            value={order.status || "Placed"}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                          >
                            <option value="Placed">Placed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-empty">
                        No food orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "Rides" && (
          <section className="admin-table-section">
            <div className="admin-table-heading">
              <div>
                <h2>Ride Bookings Management</h2>
                <p>View and update customer ride bookings.</p>
              </div>

              <div className="admin-filter-group">
                <input
                  type="text"
                  className="admin-search"
                  placeholder="Search customer or location..."
                  value={rideSearch}
                  onChange={(e) => setRideSearch(e.target.value)}
                />

                <select
                  className="admin-filter"
                  value={rideFilter}
                  onChange={(e) => setRideFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Booked">Booked</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Pickup</th>
                    <th>Destination</th>
                    <th>Vehicle</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRides.length > 0 ? (
                    filteredRides.map((ride) => (
                      <tr key={ride._id}>
                        <td>{getRideCustomer(ride)}</td>

                        <td>
                          {ride.pickupLocation || ride.pickup || "N/A"}
                        </td>

                        <td>
                          {ride.dropLocation ||
                            ride.destination ||
                            ride.drop ||
                            "N/A"}
                        </td>

                        <td>
                          {ride.vehicleType || ride.vehicle || "N/A"}
                        </td>

                        <td>{formatCurrency(ride.fare)}</td>
                        <td>{ride.status || "Booked"}</td>

                        <td>
                          <select
                            className="admin-status-select"
                            value={ride.status || "Booked"}
                            onChange={(e) =>
                              updateRideStatus(ride._id, e.target.value)
                            }
                          >
                            <option value="Booked">Booked</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="admin-empty">
                        No rides found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;
