import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  ShoppingBag,
  Receipt,
  Download,
  CircleDot,
  Navigation,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || "Unable to load order details");
        }
      } catch (error) {
        console.error("FETCH ORDER DETAILS ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load order details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, token, navigate]);

  useEffect(() => {
    const fetchTracking = async () => {
      if (!id || !token) return;

      try {
        setTrackingLoading(true);
        setTrackingError("");

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${id}/tracking`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (data.success) {
          setTracking(data.tracking);
        } else {
          setTrackingError(
            data.message || "Unable to load tracking information",
          );
        }
      } catch (error) {
        console.error("FETCH ORDER TRACKING ERROR:", error);

        setTrackingError(
          error.response?.data?.message ||
            "Unable to load shipping information.",
        );
      } finally {
        setTrackingLoading(false);
      }
    };

    fetchTracking();
  }, [id, token]);

  // ==========================================
  // REAL-TIME SHIPPING UPDATES
  // ==========================================

  useEffect(() => {
    if (!token || !id) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    const socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Customer shipping socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Customer shipping socket error:", error.message);
    });

    socket.on("customer:shipping:update", (data) => {
      console.log("REAL-TIME SHIPPING UPDATE:", data);

      // Ignore updates belonging to another order.
      if (String(data?.orderId) !== String(id)) {
        return;
      }

      // ==========================================
      // UPDATE SHIPPING INFORMATION
      // ==========================================

      setTracking((currentTracking) => {
        if (!currentTracking) {
          return currentTracking;
        }

        const incomingHistory = data.historyEvent
          ? {
              ...data.historyEvent,
              createdAt:
                data.historyEvent.eventDate || new Date().toISOString(),
            }
          : null;

        let updatedHistory = currentTracking.history || [];

        if (incomingHistory) {
          const alreadyExists = updatedHistory.some(
            (event) =>
              event.status === incomingHistory.status &&
              String(event.eventDate) === String(incomingHistory.eventDate),
          );

          if (!alreadyExists) {
            updatedHistory = [...updatedHistory, incomingHistory];
          }
        }

        return {
          ...currentTracking,

          orderStatus:
            data.shipping?.status === "delivered"
              ? "Delivered"
              : ["picked_up", "in_transit", "out_for_delivery"].includes(
                    data.shipping?.status,
                  )
                ? "Shipped"
                : currentTracking.orderStatus,

          shipping: {
            ...currentTracking.shipping,
            ...data.shipping,
          },

          history: updatedHistory,
        };
      });

      // ==========================================
      // UPDATE MAIN ORDER STATUS
      // ==========================================

      if (data.shipping?.status === "delivered") {
        setOrder((currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                orderStatus: "Delivered",
              }
            : currentOrder,
        );
      } else if (
        ["picked_up", "in_transit", "out_for_delivery"].includes(
          data.shipping?.status,
        )
      ) {
        setOrder((currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                orderStatus: "Shipped",
              }
            : currentOrder,
        );
      }
    });

    return () => {
      console.log("Disconnecting customer shipping socket");

      socket.disconnect();
    };
  }, [id, token]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle2 size={18} />;

      case "Shipped":
        return <Truck size={18} />;

      case "Confirmed":
        return <Package size={18} />;

      case "Cancelled":
        return <XCircle size={18} />;

      case "Pending":
      default:
        return <Clock3 size={18} />;
    }
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

  const getPaymentStyle = (status) => {
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

  const shippingSteps = [
    {
      key: "pickup_scheduled",
      label: "Pickup Scheduled",
      description: "Your order is ready for courier pickup.",
      icon: Clock3,
    },
    {
      key: "picked_up",
      label: "Picked Up",
      description: "Your package has been collected by the courier.",
      icon: Package,
    },
    {
      key: "in_transit",
      label: "In Transit",
      description: "Your package is on its way.",
      icon: Truck,
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      description: "Your package is out for delivery.",
      icon: Navigation,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Your package has been delivered.",
      icon: CheckCircle2,
    },
  ];

  const getShippingStepIndex = (status) => {
    const index = shippingSteps.findIndex((step) => step.key === status);

    return index;
  };

  const getShippingStatusLabel = (status) => {
    const labels = {
      not_created: "Preparing Your Order",
      creating: "Creating Shipment",
      created: "Shipment Created",
      awb_generating: "Assigning Courier",
      awb_assigned: "Courier Assigned",
      pickup_scheduling: "Scheduling Pickup",
      pickup_scheduled: "Pickup Scheduled",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Shipment Cancelled",
      rto: "Returning to Seller",
      exception: "Delivery Exception",
      failed: "Shipping Failed",
    };

    return labels[status] || "Shipping Update";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded-xl w-24" />
            <div className="h-12 bg-gray-200 rounded-xl w-80" />
            <div className="h-40 bg-gray-200 rounded-3xl" />
            <div className="h-80 bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-red-100 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5">
              <XCircle size={30} />
            </div>

            <h1 className="text-2xl font-serif text-gray-900">
              Order Not Found
            </h1>

            <p className="text-gray-500 mt-2">
              {error || "We couldn't find this order."}
            </p>

            <button
              onClick={() => navigate("/orders")}
              className="mt-7 bg-black text-white px-7 py-3 rounded-full text-sm font-medium"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-5"
            >
              <ArrowLeft size={17} />
              Back to My Orders
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                <Package size={22} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[2px] text-gray-400">
                  Order
                </p>

                <h1 className="text-3xl md:text-4xl font-serif text-gray-900">
                  #{order._id.slice(-8).toUpperCase()}
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
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

        {/* STATUS */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[2px] text-gray-400">
                Order Status
              </p>

              <div
                className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(
                  order.orderStatus,
                )}`}
              >
                {getStatusIcon(order.orderStatus)}
                {order.orderStatus}
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-xs uppercase tracking-[2px] text-gray-400">
                Payment
              </p>

              <p
                className={`mt-2 text-sm font-medium capitalize ${getPaymentStyle(
                  order.paymentStatus,
                )}`}
              >
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-[1.5fr_0.8fr] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* PRODUCTS */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Package size={20} />
                  <h2 className="text-xl font-serif text-gray-900">
                    Items in Your Order
                  </h2>
                </div>
              </div>

              <div className="px-6 md:px-8">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={`${order._id}-${item.productId?._id || index}`}
                    className="flex gap-5 py-6 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-24 h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-base">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        ₹{Number(item.price).toLocaleString("en-IN")} ×{" "}
                        {item.quantity}
                      </p>

                      <p className="text-base font-semibold text-gray-900 mt-3">
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

            {/* SHIPPING & TRACKING */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Truck size={20} />

                    <div>
                      <h2 className="text-xl font-serif text-gray-900">
                        Shipping & Tracking
                      </h2>

                      <p className="text-xs text-gray-500 mt-1">
                        Live delivery updates for your order
                      </p>
                    </div>
                  </div>

                  {tracking?.shipping?.status && (
                    <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700">
                      <CircleDot size={12} />
                      {getShippingStatusLabel(tracking.shipping.status)}
                    </span>
                  )}
                </div>
              </div>

              {trackingLoading ? (
                <div className="p-6 md:p-8 space-y-5">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-40" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="h-20 bg-gray-100 rounded-2xl" />
                  </div>
                </div>
              ) : trackingError ? (
                <div className="p-6 md:p-8">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <p className="text-sm text-gray-600">{trackingError}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  {tracking?.shipping?.status === "not_created" ||
                  !tracking?.shipping?.status ? (
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Package size={21} className="text-gray-500" />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        Your order is being prepared
                      </h3>

                      <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                        Shipping information will appear here once your order
                        has been handed over for delivery.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* COURIER DETAILS */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {tracking.shipping.courierName && (
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400">
                              Courier
                            </p>

                            <p className="text-sm font-semibold text-gray-900 mt-2">
                              {tracking.shipping.courierName}
                            </p>
                          </div>
                        )}

                        {tracking.shipping.awb && (
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400">
                              Tracking / AWB
                            </p>

                            <p className="text-sm font-mono font-semibold text-gray-900 mt-2 break-all">
                              {tracking.shipping.awb}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* TRACKING BUTTON */}
                      {tracking.shipping.trackingUrl && (
                        <a
                          href={tracking.shipping.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-full text-sm font-medium hover:scale-[1.01] transition mb-8"
                        >
                          <ExternalLink size={17} />
                          Track Shipment
                        </a>
                      )}

                      {/* SHIPPING TIMELINE */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <p className="text-xs uppercase tracking-[2px] text-gray-400">
                              Delivery Progress
                            </p>

                            <h3 className="text-lg font-serif text-gray-900 mt-1">
                              {getShippingStatusLabel(tracking.shipping.status)}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-0">
                          {shippingSteps.map((step, index) => {
                            const currentIndex = getShippingStepIndex(
                              tracking.shipping.status,
                            );

                            const isCompleted =
                              currentIndex >= 0 && index < currentIndex;

                            const isCurrent = currentIndex === index;

                            const Icon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className="relative flex gap-4"
                              >
                                {index < shippingSteps.length - 1 && (
                                  <div
                                    className={`absolute left-4.25 top-9 w-px h-[calc(100%-20px)] ${
                                      isCompleted ? "bg-black" : "bg-gray-200"
                                    }`}
                                  />
                                )}

                                <div
                                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${
                                    isCompleted || isCurrent
                                      ? "bg-black text-white"
                                      : "bg-gray-100 text-gray-400"
                                  } ${isCurrent ? "ring-4 ring-gray-100" : ""}`}
                                >
                                  <Icon size={16} />
                                </div>

                                <div className="pb-7">
                                  <p
                                    className={`text-sm font-semibold ${
                                      isCompleted || isCurrent
                                        ? "text-gray-900"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {step.label}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SHIPPING ACTIVITY */}
                      {tracking?.history?.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-5">
                            <RefreshCw size={16} />

                            <h3 className="text-lg font-serif text-gray-900">
                              Shipping Activity
                            </h3>
                          </div>

                          <div className="space-y-5">
                            {[...tracking.history]
                              .reverse()
                              .map((event, index) => (
                                <div
                                  key={`${event.eventDate}-${event.status}-${index}`}
                                  className="flex gap-4"
                                >
                                  <div className="w-2 h-2 rounded-full bg-black mt-2 shrink-0" />

                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {event.activity ||
                                          event.description ||
                                          getShippingStatusLabel(event.status)}
                                      </p>

                                      <p className="text-[11px] text-gray-400">
                                        {formatDateTime(event.eventDate)}
                                      </p>
                                    </div>

                                    {event.location && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {event.location}
                                      </p>
                                    )}

                                    {event.description &&
                                      event.description !== event.activity && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {event.description}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* SHIPPING DATES */}
                      <div className="grid sm:grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                        {tracking.shipping.pickupScheduledAt && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[1.5px] text-gray-400">
                              Pickup
                            </p>

                            <p className="text-xs font-medium text-gray-800 mt-1">
                              {formatDateTime(
                                tracking.shipping.pickupScheduledAt,
                              )}
                            </p>
                          </div>
                        )}

                        {tracking.shipping.shippedAt && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[1.5px] text-gray-400">
                              Shipped
                            </p>

                            <p className="text-xs font-medium text-gray-800 mt-1">
                              {formatDateTime(tracking.shipping.shippedAt)}
                            </p>
                          </div>
                        )}

                        {tracking.shipping.deliveredAt && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[1.5px] text-gray-400">
                              Delivered
                            </p>

                            <p className="text-xs font-medium text-gray-800 mt-1">
                              {formatDateTime(tracking.shipping.deliveredAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  <h2 className="text-xl font-serif text-gray-900">
                    Delivery Address
                  </h2>
                </div>
              </div>

              <div className="px-6 md:px-8 py-6">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.firstName}{" "}
                  {order.shippingAddress?.lastName}
                </p>

                <p className="text-sm text-gray-600 mt-3">
                  {order.shippingAddress?.address}
                </p>

                {order.shippingAddress?.apartment && (
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress.apartment}
                  </p>
                )}

                <p className="text-sm text-gray-600 mt-1">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  - {order.shippingAddress?.pincode}
                </p>

                {order.shippingAddress?.country && (
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shippingAddress.country}
                  </p>
                )}

                {order.shippingAddress?.phone && (
                  <p className="text-sm text-gray-600 mt-4">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}

                {order.shippingAddress?.email && (
                  <p className="text-sm text-gray-600 mt-1 break-all">
                    Email: {order.shippingAddress.email}
                  </p>
                )}
              </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} />
                  <h2 className="text-xl font-serif text-gray-900">
                    Payment Information
                  </h2>
                </div>
              </div>

              <div className="px-6 md:px-8 py-6 space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Payment method</span>

                  <span className="font-medium text-gray-900 capitalize">
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Razorpay"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Payment status</span>

                  <span
                    className={`font-medium capitalize ${getPaymentStyle(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                {order.paidAt && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Paid on</span>

                    <span className="font-medium text-gray-900">
                      {formatDateTime(order.paidAt)}
                    </span>
                  </div>
                )}

                {order.paymentResult?.razorpay_payment_id && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">
                      Razorpay Payment ID
                    </p>

                    <p className="text-sm font-mono text-gray-800 break-all">
                      {order.paymentResult.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* ORDER SUMMARY */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Receipt size={20} />
                  <h2 className="text-xl font-serif text-gray-900">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items</span>

                  <span className="font-medium text-gray-900">
                    {order.orderItems?.reduce(
                      (total, item) => total + Number(item.quantity || 0),
                      0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-900">
                    ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs uppercase tracking-[2px] text-gray-400">
                        Total
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Including shipping
                      </p>
                    </div>

                    <p className="text-2xl font-semibold text-gray-900">
                      ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER TIMELINE */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-serif text-gray-900">
                Order Information
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Package size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order placed
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Payment received
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(order.paidAt)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    {getStatusIcon(order.orderStatus)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current status
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {order.orderStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* INVOICE */}
            {order.invoice?.invoiceNumber && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <Receipt size={20} />

                  <h2 className="text-lg font-serif text-gray-900">Invoice</h2>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[2px] text-gray-400">
                    Invoice Number
                  </p>

                  <p className="text-base font-semibold text-gray-900 mt-2">
                    {order.invoice.invoiceNumber}
                  </p>

                  {order.invoice.issuedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Issued on {formatDate(order.invoice.issuedAt)}
                    </p>
                  )}
                </div>

                <button
                  onClick={async () => {
                    try {
                      const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/invoices/${order._id}/pdf`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                          responseType: "blob",
                        },
                      );

                      const blob = new Blob([response.data], {
                        type: "application/pdf",
                      });

                      const url = window.URL.createObjectURL(blob);

                      const link = document.createElement("a");

                      link.href = url;

                      link.download = `${order.invoice.invoiceNumber}.pdf`;

                      document.body.appendChild(link);

                      link.click();

                      link.remove();

                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("DOWNLOAD INVOICE ERROR:", error);

                      alert(
                        error.response?.data?.message ||
                          "Unable to download invoice",
                      );
                    }
                  }}
                  className="w-full mt-5 flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-full text-sm font-medium hover:scale-[1.01] transition"
                >
                  <Download size={17} />
                  Download Invoice
                </button>
              </div>
            )}

            {/* BACK BUTTON */}
            <button
              onClick={() => navigate("/orders")}
              className="w-full border border-black text-black py-3 rounded-full text-sm font-medium hover:bg-black hover:text-white transition"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
