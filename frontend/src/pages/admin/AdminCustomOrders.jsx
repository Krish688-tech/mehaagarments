
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  Palette,
  Clock3,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const statusOptions = [
  "NEW_REQUEST",
  "UNDER_REVIEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "APPROVED",
  "IN_PRODUCTION",
  "COMPLETED",
  "REJECTED",
];

const statusLabels = {
  NEW_REQUEST: "New Request",
  UNDER_REVIEW: "Under Review",
  CONTACTED: "Contacted",
  QUOTATION_SENT: "Quotation Sent",
  APPROVED: "Approved",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const statusStyles = {
  NEW_REQUEST: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  CONTACTED: "bg-purple-50 text-purple-700",
  QUOTATION_SENT: "bg-indigo-50 text-indigo-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  IN_PRODUCTION: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminCustomOrders = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ==========================================
  // FETCH CUSTOM ORDERS
  // ==========================================

  const fetchCustomOrders = useCallback(
    async (showRefresh = false) => {
      if (!token) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${API_URL}/admin/custom-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch custom orders."
          );
        }

        setCustomOrders(data.customOrders || []);
      } catch (fetchError) {
        console.error("Custom orders fetch error:", fetchError);
        setError(fetchError.message || "Something went wrong.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchCustomOrders();
  }, [fetchCustomOrders]);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    return {
      total: customOrders.length,

      newRequests: customOrders.filter(
        (item) => item.status === "NEW_REQUEST"
      ).length,

      underReview: customOrders.filter(
        (item) => item.status === "UNDER_REVIEW"
      ).length,

      inProduction: customOrders.filter(
        (item) => item.status === "IN_PRODUCTION"
      ).length,

      completed: customOrders.filter(
        (item) => item.status === "COMPLETED"
      ).length,
    };
  }, [customOrders]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customOrders.filter((order) => {
      const customerName = order.customer?.name || "";
      const customerEmail = order.customer?.email || "";
      const orderId = order._id || "";

      const matchesSearch =
        !query ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query) ||
        orderId.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customOrders, search, statusFilter]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-gray-500" size={30} />
          <p className="mt-3 text-sm text-gray-500">
            Loading custom orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
            Mehaa Garments / Administration
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Custom Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer-designed Pattu saree requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ==================================
          ERROR
      ================================== */}

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================
          STATISTICS
      ================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {[
          {
            label: "Total Requests",
            value: stats.total,
            icon: FileText,
            color: "text-gray-700",
          },
          {
            label: "New Requests",
            value: stats.newRequests,
            icon: Clock3,
            color: "text-blue-600",
          },
          {
            label: "Under Review",
            value: stats.underReview,
            icon: Search,
            color: "text-amber-600",
          },
          {
            label: "In Production",
            value: stats.inProduction,
            icon: Palette,
            color: "text-orange-600",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-green-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="border border-gray-200 bg-white p-5 transition hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">
                  {stat.label}
                </p>

                <Icon size={19} className={stat.color} />
              </div>

              <h2 className="mt-4 text-3xl font-semibold tabular-nums text-gray-900">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* ==================================
          FILTERS
      ================================== */}

      <div className="flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email or request ID..."
            className="w-full border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-500 sm:w-56"
        >
          <option value="ALL">All Statuses</option>

          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      {/* ==================================
          REQUEST TABLE
      ================================== */}

      <div className="overflow-hidden border border-gray-200 bg-white">

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Customer Requests
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredOrders.length} request(s) found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">

            <thead className="bg-gray-50">
              <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Zari Type</th>
                <th className="px-5 py-4 font-medium">Occasion</th>
                <th className="px-5 py-4 font-medium">Reference</th>
                <th className="px-5 py-4 font-medium">Submitted</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <ImageIcon
                      size={34}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-700">
                      No custom requests found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`transition hover:bg-gray-50 ${
                      order.status === "NEW_REQUEST"
                        ? "bg-amber-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.customer?.name || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.customer?.email || "No email"}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-gray-400">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {order.zariType === "gold" ? "Gold Zari" : "Silver Zari"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.occasion || "Not specified"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon size={15} className="text-gray-400" />
                        {order.referenceImages?.length || 0} images
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium ${
                          statusStyles[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/custom-orders/${order._id}`)
                        }
                        className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-black hover:bg-black hover:text-white"
                      >
                        <Eye size={14} />
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
    </div>
  );
};

export default AdminCustomOrders;
