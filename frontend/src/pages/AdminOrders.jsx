import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ============================================================
  // STATE
  // ============================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 20,
  });

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [newOrderIds, setNewOrderIds] = useState(() => new Set());
  const SEEN_ORDERS_KEY = "mehaa_admin_seen_orders";

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  const fetchOrders = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status) {
          params.set("status", status);
        }

        if (payment) {
          params.set("payment", payment);
        }

        params.set("page", page);
        params.set("limit", 20);

        const response = await fetch(
          `${API_URL}/admin/orders?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }

        const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];

        setOrders(fetchedOrders);

        const storedSeenOrders = localStorage.getItem(SEEN_ORDERS_KEY);

        if (storedSeenOrders === null) {
          // First-time setup: don't highlight existing orders.
          const initialSeenIds = fetchedOrders.map((order) => order._id);
          localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(initialSeenIds));
          setNewOrderIds(new Set());
        } else {
          const seenIds = new Set(JSON.parse(storedSeenOrders));

          setNewOrderIds(
            new Set(
              fetchedOrders
                .filter((order) => !seenIds.has(order._id))
                .map((order) => order._id),
            ),
          );
        }

        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalOrders: 0,
            limit: 20,
          },
        );
      } catch (error) {
        console.error("Admin orders error:", error);

        setError(error.message || "Unable to load orders. Please try again.");

        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_URL, token, search, status, payment, page],
  );

  // ============================================================
  // INITIAL / FILTER FETCH
  // ============================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders();
  }, [fetchOrders, token]);

  // ============================================================
  // APPLY FILTERS
  // ============================================================

  const handleApplyFilters = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPayment("");
    setPage(1);
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    fetchOrders({ showLoader: false });
  };

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: newStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: data.order?.orderStatus || newStatus,
              }
            : order,
        ),
      );
    } catch (error) {
      console.error("Update order status error:", error);

      setError(error.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // ============================================================
  // CUSTOMER NAME
  // ============================================================

  const getCustomerName = (order) => {
    if (order.user?.name) {
      return order.user.name;
    }

    const firstName = order.shippingAddress?.firstName || "";

    const lastName = order.shippingAddress?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Guest Customer";
  };

  // ============================================================
  // CUSTOMER EMAIL
  // ============================================================

  const getCustomerEmail = (order) => {
    return order.user?.email || order.shippingAddress?.email || "—";
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (orderStatus) => {
    switch (orderStatus) {
      case "Confirmed":
        return "bg-blue-50 text-blue-700";

      case "Shipped":
        return "bg-purple-50 text-purple-700";

      case "Delivered":
        return "bg-green-50 text-green-700";

      case "Cancelled":
        return "bg-red-50 text-red-700";

      case "Pending":
      default:
        return "bg-yellow-50 text-yellow-700";
    }
  };

  // ============================================================
  // PAYMENT CLASS
  // ============================================================

  const getPaymentClass = (order) => {
    if (order.isPaid || order.paymentStatus === "paid") {
      return "bg-green-50 text-green-700";
    }

    if (order.paymentStatus === "failed") {
      return "bg-red-50 text-red-700";
    }

    return "bg-yellow-50 text-yellow-700";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-125 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading orders...</div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Mehaa Garments
          </p>

          <h1 className="mt-2 font-serif text-4xl text-gray-900">Orders</h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage customer orders and fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border border-gray-300 bg-white px-6 py-3 text-sm text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Total Orders
          </p>

          <p className="mt-3 text-3xl font-medium text-gray-900">
            {pagination.totalOrders}
          </p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Paid Orders
          </p>

          <p className="mt-3 text-3xl font-medium text-green-600">
            {
              orders.filter(
                (order) => order.isPaid || order.paymentStatus === "paid",
              ).length
            }
          </p>

          <p className="mt-2 text-xs text-gray-400">Current page</p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Pending Orders
          </p>

          <p className="mt-3 text-3xl font-medium text-yellow-600">
            {orders.filter((order) => order.orderStatus === "Pending").length}
          </p>

          <p className="mt-2 text-xs text-gray-400">Current page</p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            Page Revenue
          </p>

          <p className="mt-3 text-3xl font-medium text-gray-900">
            {formatCurrency(
              orders.reduce(
                (total, order) => total + Number(order.totalPrice || 0),
                0,
              ),
            )}
          </p>

          <p className="mt-2 text-xs text-gray-400">Current page</p>
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* SEARCH */}

          <div className="lg:col-span-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-500">
              Search Orders
            </label>

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleApplyFilters();
                }
              }}
              placeholder="Search customer, email or order ID..."
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-500">
              Order Status
            </label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* PAYMENT */}

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-gray-500">
              Payment
            </label>

            <select
              value={payment}
              onChange={(event) => {
                setPayment(event.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="razorpay">Razorpay</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* BUTTONS */}

          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-300 bg-white px-6 py-3 text-sm text-gray-700 transition hover:border-black hover:text-black"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          ORDERS TABLE
      ====================================================== */}

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-275 w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Order
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Items
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Total
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Payment
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <p className="text-sm font-medium text-gray-700">
                      No orders found
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      Orders will appear here when customers place orders.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className={`border-b border-gray-100 transition ${
                      newOrderIds.has(order._id)
                        ? "bg-gray-100 hover:bg-gray-200"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {/* ORDER */}

                    <td className="px-6 py-5">
                      <p className="font-mono text-xs text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">{order._id}</p>

                      {newOrderIds.has(order._id) && (
                        <span className="mt-2 inline-flex rounded-full bg-gray-800 px-2 py-1 text-[10px] font-semibold tracking-wider text-white">
                          NEW ORDER
                        </span>
                      )}
                    </td>

                    {/* CUSTOMER */}

                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-gray-900">
                        {getCustomerName(order)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {getCustomerEmail(order)}
                      </p>
                    </td>

                    {/* ITEMS */}

                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-900">
                        {order.orderItems?.length || 0} product
                        {order.orderItems?.length === 1 ? "" : "s"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {(order.orderItems || []).reduce(
                          (total, item) => total + Number(item.quantity || 0),
                          0,
                        )}{" "}
                        item
                        {(order.orderItems || []).reduce(
                          (total, item) => total + Number(item.quantity || 0),
                          0,
                        ) === 1
                          ? ""
                          : "s"}
                      </p>
                    </td>

                    {/* TOTAL */}

                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </td>

                    {/* PAYMENT */}

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPaymentClass(order)}`}
                      >
                        {order.isPaid || order.paymentStatus === "paid"
                          ? "Paid"
                          : order.paymentMethod === "cod"
                            ? "COD"
                            : order.paymentStatus === "failed"
                              ? "Failed"
                              : "Pending"}
                      </span>

                      <p className="mt-2 text-xs capitalize text-gray-400">
                        {order.paymentMethod || "—"}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">
                      <select
                        value={order.orderStatus || "Pending"}
                        disabled={
                          updatingOrderId === order._id ||
                          order.orderStatus === "Delivered" ||
                          order.orderStatus === "Cancelled"
                        }
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value)
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(order.orderStatus)} disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        <option value="Pending">Pending</option>

                        <option value="Confirmed">Confirmed</option>

                        <option value="Shipped">Shipped</option>

                        <option value="Delivered">Delivered</option>

                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {updatingOrderId === order._id && (
                        <p className="mt-1 text-[10px] text-gray-400">
                          Updating...
                        </p>
                      )}
                    </td>

                    {/* DATE */}

                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-700">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("admin:order-viewed", {
                              detail: { orderId: order._id },
                            }),
                          );

                          const seenIds = new Set(
                            JSON.parse(
                              localStorage.getItem(SEEN_ORDERS_KEY) || "[]",
                            ),
                          );

                          seenIds.add(order._id);

                          localStorage.setItem(
                            SEEN_ORDERS_KEY,
                            JSON.stringify([...seenIds]),
                          );

                          setNewOrderIds((current) => {
                            const updated = new Set(current);
                            updated.delete(order._id);
                            return updated;
                          });

                          navigate(`/admin/orders/${order._id}`);
                        }}
                        className="border border-gray-300 px-4 py-2 text-xs text-gray-700 transition hover:border-black hover:text-black"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-4 border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((currentPage) => Math.max(currentPage - 1, 1))
              }
              className="border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(currentPage + 1, pagination.totalPages),
                )
              }
              className="border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
