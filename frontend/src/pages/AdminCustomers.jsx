import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, Search, RefreshCw, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, ShoppingBag, IndianRupee, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // =====================================================
  // CUSTOMER DATA
  // =====================================================

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("all");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =====================================================
  // CUSTOMER DETAILS
  // =====================================================

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerStatistics, setCustomerStatistics] = useState({
    totalOrders: 0,
    totalSpent: 0,
  });

  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [token, user, navigate]);

  // =====================================================
  // FETCH CUSTOMERS
  // =====================================================

  const fetchCustomers = useCallback(
    async (page = 1) => {
      if (!token || user?.role !== "admin") {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", "10");

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (status !== "all") {
          params.append("status", status);
        }

        const { data } = await axios.get(
          `${API_URL}/users/admin/all?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCustomers(data.customers || []);

        setPagination(
          data.pagination || {
            page,
            limit: 10,
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        );
      } catch (error) {
        console.error("Failed to fetch customers:", error);

        if (error.response?.status === 401) {
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load customers. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, user, search, status],
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      return;
    }

    fetchCustomers(1);
  }, [token, user, fetchCustomers]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setSearch(searchInput.trim());
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
  };

  // =====================================================
  // VIEW CUSTOMER
  // =====================================================

  const handleViewCustomer = async (customerId) => {
    try {
      setDetailsLoading(true);
      setOrdersLoading(true);
      setSelectedCustomer(null);
      setCustomerOrders([]);

      const [customerResponse, ordersResponse] = await Promise.all([
        axios.get(`${API_URL}/users/admin/${customerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(`${API_URL}/users/admin/${customerId}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setSelectedCustomer(customerResponse.data.customer || null);

      setCustomerStatistics(
        customerResponse.data.statistics || {
          totalOrders: 0,
          totalSpent: 0,
        },
      );

      setCustomerOrders(ordersResponse.data.orders || []);
    } catch (error) {
      console.error("Failed to load customer details:", error);

      if (error.response?.status === 401) {
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Unable to load customer",
        text:
          error.response?.data?.message ||
          "Please try again.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setDetailsLoading(false);
      setOrdersLoading(false);
    }
  };

  // =====================================================
  // CLOSE CUSTOMER DETAILS
  // =====================================================

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setCustomerStatistics({
      totalOrders: 0,
      totalSpent: 0,
    });
  };

  // =====================================================
  // UPDATE CUSTOMER STATUS
  // =====================================================

  const handleStatusChange = async (customer) => {
    const nextStatus = !customer.isActive;

    const result = await Swal.fire({
      icon: "question",
      title: nextStatus
        ? "Activate customer?"
        : "Deactivate customer?",
      text: nextStatus
        ? `${customer.name} will be able to use the account normally.`
        : `${customer.name} will no longer be able to use the account normally.`,
      showCancelButton: true,
      confirmButtonText: nextStatus ? "Activate" : "Deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: nextStatus ? "#111827" : "#b91c1c",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(customer._id);

      const { data } = await axios.patch(
        `${API_URL}/users/admin/${customer._id}/status`,
        {
          isActive: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setCustomers((previous) =>
        previous.map((item) =>
          item._id === customer._id
            ? {
                ...item,
                isActive: data.customer?.isActive ?? nextStatus,
              }
            : item,
        ),
      );

      if (selectedCustomer?._id === customer._id) {
        setSelectedCustomer((previous) =>
          previous
            ? {
                ...previous,
                isActive: data.customer?.isActive ?? nextStatus,
              }
            : previous,
        );
      }

      await Swal.fire({
        icon: "success",
        title: nextStatus ? "Customer Activated" : "Customer Deactivated",
        text:
          data.message ||
          (nextStatus
            ? "Customer activated successfully."
            : "Customer deactivated successfully."),
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Failed to update customer status:", error);

      await Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text:
          error.response?.data?.message ||
          "Unable to update customer status.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // =====================================================
  // ORDER STATUS CLASS
  // =====================================================

  const getOrderStatusClass = (orderStatus) => {
    switch (orderStatus) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // =====================================================
  // PAYMENT STATUS CLASS
  // =====================================================

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "cod_pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#faf9f7] px-5 py-8 md:px-8 lg:px-10">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[4px] text-gray-500">
          Customer Management
        </p>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-[#222] md:text-4xl">
              Customers
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Manage customer accounts, account status, contact information,
              and order history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCustomers(pagination.page)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customer by name or email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Search
          </button>

          {(search || status !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => fetchCustomers(pagination.page)}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* =================================================
          CUSTOMER TABLE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              Customer Accounts
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {pagination.total} customer
              {pagination.total === 1 ? "" : "s"} found
            </p>
          </div>

          <span className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center">
            <RefreshCw
              size={24}
              className="mx-auto mb-3 animate-spin text-gray-400"
            />

            <p className="text-sm text-gray-500">
              Loading customers...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Search size={22} className="text-gray-400" />
            </div>

            <h3 className="text-base font-medium text-gray-900">
              No customers found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-212.5 w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60"
                    >
                      {/* CUSTOMER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {customer.name || "Unnamed Customer"}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">
                          {customer.address?.phone || "No phone"}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {customer.address?.city || "No city"}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                            customer.isActive
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`mr-2 h-1.5 w-1.5 rounded-full ${
                              customer.isActive
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />

                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* JOINED */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(customer.createdAt)}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewCustomer(customer._id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(customer)
                            }
                            disabled={actionLoading === customer._id}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              customer.isActive
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {customer.isActive ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}

                            {actionLoading === customer._id
                              ? "Updating..."
                              : customer.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
              <p className="text-xs text-gray-500">
                Showing{" "}
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total,
                )}{" "}
                of {pagination.total}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || loading}
                  onClick={() =>
                    fetchCustomers(pagination.page - 1)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white">
                  {pagination.page}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() =>
                    fetchCustomers(pagination.page + 1)
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =================================================
          CUSTOMER DETAILS MODAL
      ================================================= */}

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-[#faf9f7] shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[3px] text-gray-400">
                  Customer Details
                </p>

                <h2 className="mt-1 text-xl font-medium text-gray-900">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCustomerDetails}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5 md:p-6">
              {detailsLoading ? (
                <div className="py-20 text-center">
                  <RefreshCw
                    size={25}
                    className="mx-auto mb-3 animate-spin text-gray-400"
                  />

                  <p className="text-sm text-gray-500">
                    Loading customer...
                  </p>
                </div>
              ) : (
                <>
                  {/* CUSTOMER SUMMARY */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                        <ShoppingBag size={18} />
                      </div>

                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Total Orders
                      </p>

                      <p className="mt-1 text-2xl font-medium text-gray-900">
                        {customerStatistics.totalOrders || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                        <IndianRupee size={18} />
                      </div>

                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Total Paid
                      </p>

                      <p className="mt-1 text-2xl font-medium text-gray-900">
                        {formatCurrency(
                          customerStatistics.totalSpent,
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                        {selectedCustomer.isActive ? (
                          <UserCheck size={18} />
                        ) : (
                          <UserX size={18} />
                        )}
                      </div>

                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Account Status
                      </p>

                      <p
                        className={`mt-1 text-lg font-medium ${
                          selectedCustomer.isActive
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {selectedCustomer.isActive
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {/* CUSTOMER INFORMATION */}

                  <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Contact Information
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail
                            size={17}
                            className="mt-0.5 text-gray-400"
                          />

                          <div>
                            <p className="text-xs text-gray-400">
                              Email
                            </p>

                            <p className="mt-1 break-all text-sm text-gray-800">
                              {selectedCustomer.email || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone
                            size={17}
                            className="mt-0.5 text-gray-400"
                          />

                          <div>
                            <p className="text-xs text-gray-400">
                              Phone
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                              {selectedCustomer.address?.phone ||
                                "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin
                            size={17}
                            className="mt-0.5 text-gray-400"
                          />

                          <div>
                            <p className="text-xs text-gray-400">
                              Address
                            </p>

                            <p className="mt-1 text-sm leading-6 text-gray-800">
                              {selectedCustomer.address?.address ||
                                "—"}

                              {selectedCustomer.address?.apartment
                                ? `, ${selectedCustomer.address.apartment}`
                                : ""}

                              {selectedCustomer.address?.city
                                ? `, ${selectedCustomer.address.city}`
                                : ""}

                              {selectedCustomer.address?.state
                                ? `, ${selectedCustomer.address.state}`
                                : ""}

                              {selectedCustomer.address?.pincode
                                ? ` - ${selectedCustomer.address.pincode}`
                                : ""}

                              {selectedCustomer.address?.country
                                ? `, ${selectedCustomer.address.country}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACCOUNT INFORMATION */}

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Account Information
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="text-sm text-gray-500">
                            Customer ID
                          </span>

                          <span className="max-w-55 truncate text-xs text-gray-700">
                            {selectedCustomer._id}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="text-sm text-gray-500">
                            Role
                          </span>

                          <span className="text-sm font-medium capitalize text-gray-800">
                            {selectedCustomer.role}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <span className="text-sm text-gray-500">
                            Joined
                          </span>

                          <span className="text-sm text-gray-800">
                            {formatDate(
                              selectedCustomer.createdAt,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Last Updated
                          </span>

                          <span className="text-sm text-gray-800">
                            {formatDate(
                              selectedCustomer.updatedAt,
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(selectedCustomer)
                        }
                        disabled={
                          actionLoading === selectedCustomer._id
                        }
                        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-50 ${
                          selectedCustomer.isActive
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {selectedCustomer.isActive ? (
                          <UserX size={17} />
                        ) : (
                          <UserCheck size={17} />
                        )}

                        {actionLoading === selectedCustomer._id
                          ? "Updating..."
                          : selectedCustomer.isActive
                            ? "Deactivate Customer"
                            : "Activate Customer"}
                      </button>
                    </div>
                  </div>

                  {/* ORDER HISTORY */}

                  <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-5 py-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Order History
                      </h3>
                    </div>

                    {ordersLoading ? (
                      <div className="py-12 text-center">
                        <RefreshCw
                          size={22}
                          className="mx-auto mb-3 animate-spin text-gray-400"
                        />

                        <p className="text-sm text-gray-500">
                          Loading orders...
                        </p>
                      </div>
                    ) : customerOrders.length === 0 ? (
                      <div className="px-5 py-12 text-center">
                        <ShoppingBag
                          size={24}
                          className="mx-auto mb-3 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                          This customer has no orders yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-212.5 w-full">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Order
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Date
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Payment
                              </th>

                              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                              </th>

                              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {customerOrders.map((order) => (
                              <tr
                                key={order._id}
                                className="border-b border-gray-100 last:border-b-0"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-mono text-xs text-gray-700">
                                    #{order._id?.slice(-8)}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-400">
                                    {order.orderItems?.length || 0} item
                                    {order.orderItems?.length === 1
                                      ? ""
                                      : "s"}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-gray-600">
                                  {formatDate(order.createdAt)}
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentStatusClass(
                                      order.paymentStatus,
                                    )}`}
                                  >
                                    {order.paymentStatus || "pending"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getOrderStatusClass(
                                      order.orderStatus,
                                    )}`}
                                  >
                                    {order.orderStatus || "Pending"}
                                  </span>
                                </td>

                                <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                                  {formatCurrency(
                                    order.totalPrice,
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminCustomers;