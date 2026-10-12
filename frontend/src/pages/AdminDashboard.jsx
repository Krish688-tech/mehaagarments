import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { token } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/dashboard`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        setDashboard(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statistics = dashboard?.statistics || {};

  const recentOrders = dashboard?.recentOrders || [];

  const topProducts = dashboard?.topProducts || [];

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatOrderId = (order) => {
    if (!order) return "—";

    if (order.orderNumber) {
      return order.orderNumber;
    }

    if (order._id) {
      return `#${String(order._id).slice(-8).toUpperCase()}`;
    }

    if (order.id) {
      return `#${String(order.id).slice(-8).toUpperCase()}`;
    }

    return "—";
  };

  const getCustomerName = (order) => {
    return (
      order?.user?.name ||
      order?.customer?.name ||
      order?.customerName ||
      order?.shippingAddress?.name ||
      "Guest Customer"
    );
  };

  const getCustomerEmail = (order) => {
    return (
      order?.user?.email ||
      order?.customer?.email ||
      order?.customerEmail ||
      "—"
    );
  };

  const getOrderAmount = (order) => {
    return (
      order?.totalAmount ??
      order?.totalPrice ??
      order?.amount ??
      order?.grandTotal ??
      0
    );
  };

  const getOrderStatus = (order) => {
    return (
      order?.orderStatus ||
      order?.status ||
      order?.paymentStatus ||
      "Pending"
    );
  };

  const getProductName = (product) => {
    return (
      product?.name ||
      product?.productName ||
      product?.title ||
      "Unknown Product"
    );
  };

  const getProductImage = (product) => {
    return (
      product?.mainImage?.url ||
      product?.mainImage ||
      product?.image ||
      product?.images?.[0]?.url ||
      product?.images?.[0] ||
      ""
    );
  };

  const getProductSales = (product) => {
    return (
      product?.totalSold ??
      product?.soldQuantity ??
      product?.quantitySold ??
      product?.sales ??
      product?.count ??
      0
    );
  };

  const statCards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(statistics.totalRevenue),
        description: "Revenue from paid orders",
        icon: "₹",
      },
      {
        title: "Total Orders",
        value: statistics.totalOrders ?? 0,
        description: `${statistics.paidOrders ?? 0} paid orders`,
        icon: "O",
      },
      {
        title: "Total Customers",
        value: statistics.totalCustomers ?? 0,
        description: "Registered customers",
        icon: "C",
      },
      {
        title: "Total Products",
        value: statistics.totalProducts ?? 0,
        description: `${statistics.activeProducts ?? 0} active products`,
        icon: "P",
      },
    ],
    [statistics]
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-9 w-72 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            <div className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
              !
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchDashboard()}
              className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">
              Mehaa Garments
            </p>

            <h1 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor your store performance, products, customers and orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/admin/products/add"
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* =====================================================
            MAIN STATISTICS
        ===================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-700">
                  {card.icon}
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* =====================================================
            SECONDARY STATISTICS
        ===================================================== */}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Products */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>

            <p className="mt-2 text-2xl font-semibold text-green-600">
              {statistics.activeProducts ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Available on storefront
            </p>
          </div>

          {/* Inactive Products */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Inactive Products</p>

            <p className="mt-2 text-2xl font-semibold text-gray-600">
              {statistics.inactiveProducts ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Currently hidden
            </p>
          </div>

          {/* Low Stock */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Low Stock</p>

            <p className="mt-2 text-2xl font-semibold text-orange-600">
              {statistics.lowStockProducts ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Products needing attention
            </p>
          </div>

          {/* Pending Orders */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Orders</p>

            <p className="mt-2 text-2xl font-semibold text-yellow-600">
              {statistics.pendingOrders ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Awaiting processing
            </p>
          </div>
        </div>

        {/* =====================================================
            ORDER / PAYMENT OVERVIEW
        ===================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid Orders</p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics.paidOrders ?? 0}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                ✓
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${
                    statistics.totalOrders
                      ? Math.min(
                          (statistics.paidOrders / statistics.totalOrders) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics.pendingOrders ?? 0}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
                !
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-yellow-500"
                style={{
                  width: `${
                    statistics.totalOrders
                      ? Math.min(
                          (statistics.pendingOrders / statistics.totalOrders) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Product Availability</p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {statistics.totalProducts
                    ? Math.round(
                        (statistics.activeProducts /
                          statistics.totalProducts) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                P
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-black"
                style={{
                  width: `${
                    statistics.totalProducts
                      ? Math.min(
                          (statistics.activeProducts /
                            statistics.totalProducts) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT ORDERS + TOP PRODUCTS
        ===================================================== */}

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {/* =================================================
              RECENT ORDERS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Latest customer orders
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="text-sm font-medium text-gray-600 transition hover:text-black"
              >
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  No recent orders available.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.slice(0, 5).map((order, index) => (
                  <div
                    key={order?._id || order?.id || index}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {formatOrderId(order)}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {getCustomerName(order)}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-400">
                        {getCustomerEmail(order)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(getOrderAmount(order))}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${
                          String(getOrderStatus(order)).toLowerCase() ===
                          "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {getOrderStatus(order)}
                      </span>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatDate(order?.createdAt || order?.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* =================================================
              TOP PRODUCTS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Best performing products
                </p>
              </div>

              <Link
                to="/admin/products"
                className="text-sm font-medium text-gray-600 transition hover:text-black"
              >
                View products
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  No product sales data available.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topProducts.slice(0, 5).map((product, index) => {
                  const image = getProductImage(product);

                  return (
                    <div
                      key={product?._id || product?.id || index}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                        {index + 1}
                      </div>

                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {image ? (
                          <img
                            src={image}
                            alt={getProductName(product)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {getProductName(product)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {getProductSales(product)} sold
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            product?.price || product?.sellingPrice || 0
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Frequently used administration tools
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/products/add"
              className="rounded-xl border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900">
                Add Product
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Create a new product
              </p>
            </Link>

            <Link
              to="/admin/products"
              className="rounded-xl border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900">
                Manage Products
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Edit or deactivate products
              </p>
            </Link>

            <Link
              to="/admin/orders"
              className="rounded-xl border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900">
                Manage Orders
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Review customer orders
              </p>
            </Link>

            <Link
              to="/admin/categories"
              className="rounded-xl border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900">
                Manage Categories
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Organize your catalog
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;