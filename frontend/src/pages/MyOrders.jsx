import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MyOrders = () => {
  const navigate = useNavigate();

  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (data.success) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        } else {
          setOrders([]);
          setError(data.message || "Unable to load orders");
        }
      } catch (error) {
        console.error("FETCH MY ORDERS ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your orders. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [token, navigate]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Confirmed":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "Pending":
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600";

      case "failed":
        return "text-red-600";

      case "cod_pending":
        return "text-orange-600";

      default:
        return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-100 rounded-xl w-56" />
            <div className="h-5 bg-gray-100 rounded-xl w-72" />

            <div className="h-64 bg-gray-100 rounded-3xl" />
            <div className="h-64 bg-gray-100 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-5"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-serif text-gray-900">
                  My Orders
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Track and manage your Mehaa orders
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:scale-[1.02] transition"
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 mb-6">
            {error}
          </div>
        )}

        {/* NO ORDERS */}
        {!error && orders.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <Package size={28} className="text-gray-500" />
            </div>

            <h2 className="text-2xl font-serif text-gray-900">
              No orders yet
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              You haven't placed any orders yet. Explore our collections and
              find something beautiful for your wardrobe.
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="mt-7 bg-black text-white px-7 py-3 rounded-full text-sm font-medium hover:scale-[1.02] transition"
            >
              Explore Collections
            </button>
          </div>
        )}

        {/* ORDERS */}
        {!error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden"
              >
                {/* ORDER HEADER */}
                <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[2px] text-gray-400">
                      Order
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-medium border ${getStatusStyle(
                        order.orderStatus,
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <span
                      className={`text-xs font-medium capitalize ${getPaymentStatusStyle(
                        order.paymentStatus,
                      )}`}
                    >
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="px-6 md:px-8 py-6">
                  <div className="space-y-5">
                    {order.orderItems?.map((item, index) => (
                      <div
                        key={`${order._id}-${item.productId?._id || index}`}
                        className="flex gap-4"
                      >
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                            {item.quantity}
                          </p>

                          <p className="text-sm font-medium text-gray-900 mt-2">
                            ₹
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 md:px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {order.orderItems?.length || 0}{" "}
                      {order.orderItems?.length === 1 ? "item" : "items"}
                    </p>

                    <p className="text-xl font-semibold text-gray-900 mt-1">
                      ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="border border-black text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
                  >
                    View Order Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;