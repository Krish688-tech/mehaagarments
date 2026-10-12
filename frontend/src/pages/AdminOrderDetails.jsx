import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const SHIPPING_STATUS_LABELS = {
  not_created: "Not Created",
  creating: "Creating",
  created: "Shipment Created",
  awb_assigned: "AWB Assigned",
  pickup_scheduled: "Pickup Scheduled",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rto: "Return to Origin",
  exception: "Exception",
  failed: "Failed",
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [checkingCouriers, setCheckingCouriers] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [recommendedCourierId, setRecommendedCourierId] = useState(null);
  const [generatingAWB, setGeneratingAWB] = useState(false);
  const [schedulingPickup, setSchedulingPickup] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data.order);
      setStatus(data.order.orderStatus);
    } catch (error) {
      console.error("Admin order details error:", error);

      setError(error.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchOrder();
    }
  }, [token, id]);

  // ============================================================
  // CREATE SHIPROCKET SHIPMENT
  // ============================================================

  const handleCreateShipment = async () => {
    if (!order || creatingShipment) {
      return;
    }

    const shippingStatus = order.shipping?.status || "not_created";

    if (shippingStatus !== "not_created") {
      setError("This order is not currently eligible for shipment creation.");

      return;
    }

    try {
      setCreatingShipment(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/shipping/${order._id}/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create shipment");
      }

      if (!data.shipping) {
        throw new Error(
          "Shipment was created but shipping details were not returned.",
        );
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        shipping: data.shipping,
      }));
    } catch (error) {
      console.error("Create shipment error:", error);

      setError(error.message || "Failed to create shipment");
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleCheckCouriers = async () => {
    if (!order || checkingCouriers) {
      return;
    }

    try {
      setCheckingCouriers(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/shipping/${order._id}/couriers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check courier availability");
      }

      setCouriers(data.couriers || []);
      setRecommendedCourierId(data.recommendedCourierId || null);

      if (
        data.recommendedCourierId &&
        data.couriers?.some(
          (courier) =>
            Number(courier.courierId) === Number(data.recommendedCourierId),
        )
      ) {
        setSelectedCourierId(String(data.recommendedCourierId));
      } else if (data.couriers?.length === 1) {
        setSelectedCourierId(String(data.couriers[0].courierId));
      } else {
        setSelectedCourierId("");
      }
    } catch (error) {
      console.error("Courier serviceability error:", error);

      setCouriers([]);
      setSelectedCourierId("");
      setRecommendedCourierId(null);

      setError(error.message || "Failed to check courier availability");
    } finally {
      setCheckingCouriers(false);
    }
  };

  const handleGenerateAWB = async () => {
    if (!order || generatingAWB || !selectedCourierId) {
      return;
    }

    try {
      setGeneratingAWB(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/shipping/${order._id}/awb`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courierId: Number(selectedCourierId),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate AWB");
      }

      if (!data.shipping) {
        throw new Error(
          "AWB was generated but shipping details were not returned.",
        );
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        shipping: data.shipping,
      }));

      setCouriers([]);
      setSelectedCourierId("");
      setRecommendedCourierId(null);
    } catch (error) {
      console.error("Generate AWB error:", error);

      setError(error.message || "Failed to generate AWB");
    } finally {
      setGeneratingAWB(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!order?._id) return;

    try {
      setSchedulingPickup(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/admin/shipping/${order._id}/pickup`,
        {
          pickupDate: pickupDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Pickup Scheduled",
          text:
            response.data.message ||
            "Shipment pickup has been scheduled successfully.",
          confirmButtonColor: "#111827",
        });

        // Refresh order details
        await fetchOrder();

        // Clear selected date
        setPickupDate("");
      }
    } catch (error) {
      console.error(
        "Schedule pickup error:",
        error.response?.data || error.message,
      );

      Swal.fire({
        icon: "error",
        title: "Pickup Scheduling Failed",
        text:
          error.response?.data?.message ||
          "Unable to schedule shipment pickup.",
        confirmButtonColor: "#111827",
      });
    } finally {
      setSchedulingPickup(false);
    }
  };

  // ============================================================
  // GENERATE / VIEW INVOICE
  // ============================================================

  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/orders/${order._id}/invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate invoice");
      }

      navigate(`/admin/invoices/${order._id}`);
    } catch (error) {
      console.error("Generate invoice error:", error);

      setError(error.message || "Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  const handleStatusUpdate = async () => {
    if (!order || status === order.orderStatus) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/orders/${order._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderStatus: status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrder(data.order);
      setStatus(data.order.orderStatus);
    } catch (error) {
      console.error("Update order status error:", error);

      setError(error.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusClass = (value) => {
    switch (value) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Confirmed":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getShippingStatusClass = (shippingStatus) => {
    switch (shippingStatus) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "picked_up":
      case "in_transit":
      case "out_for_delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "awb_assigned":
      case "pickup_scheduled":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "failed":
      case "exception":
      case "rto":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "creating":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const shippingStatus = order?.shipping?.status || "not_created";

  const shippingStatusLabel =
    SHIPPING_STATUS_LABELS[shippingStatus] || shippingStatus;

  const canCreateShipment =
    shippingStatus === "not_created" &&
    order?.orderStatus !== "Cancelled" &&
    (order?.paymentMethod === "cod" ||
      (order?.paymentMethod === "razorpay" &&
        order?.paymentStatus === "paid" &&
        order?.isPaid === true));

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <div className="text-sm text-gray-500">Loading order details...</div>
      </div>
    );
  }

  // ============================================================
  // ERROR WITHOUT ORDER
  // ============================================================

  if (error && !order) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="text-sm text-gray-600 transition hover:text-black"
        >
          ← Back to Orders
        </button>

        <div className="border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-end">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mb-5 text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to Orders
          </button>

          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Mehaa Garments
          </p>

          <h1 className="mt-2 text-4xl font-serif text-gray-900">
            Order Details
          </h1>

          <p className="mt-2 break-all text-sm text-gray-500">
            Order #{order._id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={generatingInvoice}
            className="border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-900 transition hover:border-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatingInvoice
              ? "Generating..."
              : order.invoice?.invoiceNumber
                ? "View Invoice"
                : "Generate Invoice"}
          </button>

          <span
            className={`border px-4 py-2 text-xs font-medium ${getStatusClass(
              order.orderStatus,
            )}`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ORDER SUMMARY */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Order Date
          </p>

          <p className="mt-3 text-sm font-medium text-gray-900">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Total
          </p>

          <p className="mt-3 text-2xl font-medium text-gray-900">
            {formatCurrency(order.totalPrice)}
          </p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Payment
          </p>

          <p className="mt-3 text-sm font-medium capitalize text-gray-900">
            {order.paymentMethod}
          </p>

          <p className="mt-1 text-xs text-gray-500">{order.paymentStatus}</p>
        </div>

        <div className="border border-gray-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Paid
          </p>

          <p
            className={`mt-3 text-sm font-medium ${
              order.isPaid ? "text-green-600" : "text-orange-600"
            }`}
          >
            {order.isPaid ? "Paid" : "Not Paid"}
          </p>

          {order.paidAt && (
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(order.paidAt)}
            </p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-8 xl:col-span-2">
          {/* PRODUCTS */}

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>

              <p className="mt-1 text-sm text-gray-500">
                {order.orderItems?.length || 0} product(s)
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {order.orderItems?.map((item, index) => (
                <div
                  key={item.productId?._id || item.productId || index}
                  className="flex gap-5 px-6 py-6"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Unit price: {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 px-6 py-5">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Order Total</span>

                <span className="text-xl font-medium text-gray-900">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </section>

          {/* PAYMENT DETAILS */}

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">
                Payment Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Payment Method
                </p>

                <p className="mt-2 text-sm capitalize text-gray-900">
                  {order.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Payment Status
                </p>

                <p className="mt-2 text-sm capitalize text-gray-900">
                  {order.paymentStatus}
                </p>
              </div>

              {order.paymentResult?.razorpay_payment_id && (
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Razorpay Payment ID
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-900">
                    {order.paymentResult.razorpay_payment_id}
                  </p>
                </div>
              )}

              {order.paymentResult?.razorpay_order_id && (
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Razorpay Order ID
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-900">
                    {order.paymentResult.razorpay_order_id}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SHIPPING & FULFILLMENT */}

          <section className="border border-gray-200 bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Shipping & Fulfillment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage the Shiprocket shipment for this order.
                </p>
              </div>

              <span
                className={`w-fit border px-3 py-1.5 text-xs font-medium ${getShippingStatusClass(
                  shippingStatus,
                )}`}
              >
                {shippingStatusLabel}
              </span>
            </div>

            <div className="space-y-6 px-6 py-6">
              {/* PROVIDER */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Shipping Provider
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {order.shipping?.provider
                      ? order.shipping.provider.charAt(0).toUpperCase() +
                        order.shipping.provider.slice(1)
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Courier
                  </p>

                  <p className="mt-2 text-sm text-gray-900">
                    {order.shipping?.courierName || "—"}
                  </p>
                </div>
              </div>

              {/* SHIPROCKET IDS */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Shiprocket Order ID
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-900">
                    {order.shipping?.shiprocketOrderId || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Shipment ID
                  </p>

                  <p className="mt-2 break-all text-sm text-gray-900">
                    {order.shipping?.shipmentId || "—"}
                  </p>
                </div>
              </div>

              {/* AWB */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    AWB / Tracking Number
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-gray-900">
                    {order.shipping?.awb || "Not assigned yet"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Pickup
                  </p>

                  <p className="mt-2 text-sm text-gray-900">
                    {order.shipping?.pickupScheduledAt
                      ? formatDate(order.shipping.pickupScheduledAt)
                      : "Not scheduled"}
                  </p>
                </div>
              </div>

              {/* CREATED DATE */}

              {order.shipping?.createdAt && (
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                    Shipment Created
                  </p>

                  <p className="mt-2 text-sm text-gray-900">
                    {formatDate(order.shipping.createdAt)}
                  </p>
                </div>
              )}

              {/* TRACKING */}

              {order.shipping?.trackingUrl && (
                <div>
                  <a
                    href={order.shipping.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:border-black hover:bg-gray-50"
                  >
                    Track Shipment ↗
                  </a>
                </div>
              )}

              {/* ERROR */}

              {order.shipping?.lastError && (
                <div className="border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-500">
                    Shipping Error
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {order.shipping.lastError}
                  </p>
                </div>
              )}

              {/* CREATE SHIPMENT */}

              {shippingStatus === "not_created" && (
                <div className="border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={handleCreateShipment}
                    disabled={creatingShipment || !canCreateShipment}
                    className="w-full bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                  >
                    {creatingShipment
                      ? "Creating Shipment..."
                      : "Create Shipment"}
                  </button>

                  {!canCreateShipment && (
                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      {order.orderStatus === "Cancelled"
                        ? "Cancelled orders cannot be shipped."
                        : order.paymentMethod === "razorpay" && !order.isPaid
                          ? "Razorpay payment must be completed before creating a shipment."
                          : "This order is not currently eligible for shipment creation."}
                    </p>
                  )}
                </div>
              )}

              {/* CREATING */}

              {shippingStatus === "creating" && (
                <div className="border border-yellow-200 bg-yellow-50 px-4 py-4">
                  <p className="text-sm font-medium text-yellow-800">
                    Shipment creation is in progress.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-yellow-700">
                    Please do not create another shipment for this order.
                  </p>
                </div>
              )}

              {/* CREATED */}

              {shippingStatus === "created" && (
                <div className="border border-blue-200 bg-blue-50 px-4 py-4">
                  <p className="text-sm font-medium text-blue-800">
                    Shipment created successfully
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Courier assignment and AWB generation will be handled in the
                    next fulfillment step.
                  </p>
                </div>
              )}

              {/* COURIER SERVICEABILITY */}

              {shippingStatus === "created" && (
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Courier Selection
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Check available couriers for this destination before
                        generating the AWB.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckCouriers}
                      disabled={checkingCouriers}
                      className="w-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:border-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {checkingCouriers
                        ? "Checking..."
                        : couriers.length
                          ? "Refresh Couriers"
                          : "Check Couriers"}
                    </button>
                  </div>

                  {/* COURIER LIST */}

                  {couriers.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                          Available Couriers
                        </p>

                        <p className="text-xs text-gray-500">
                          {couriers.length} available
                        </p>
                      </div>

                      <div className="space-y-3">
                        {couriers.map((courier) => {
                          const isSelected =
                            String(courier.courierId) ===
                            String(selectedCourierId);

                          const isRecommended =
                            Number(courier.courierId) ===
                            Number(recommendedCourierId);

                          return (
                            <button
                              key={courier.courierId}
                              type="button"
                              onClick={() =>
                                setSelectedCourierId(String(courier.courierId))
                              }
                              className={`w-full border p-4 text-left transition ${
                                isSelected
                                  ? "border-black bg-gray-50"
                                  : "border-gray-200 bg-white hover:border-gray-400"
                              }`}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {courier.courierName}
                                    </p>

                                    {isRecommended && (
                                      <span className="border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-green-700">
                                        Recommended
                                      </span>
                                    )}

                                    {isSelected && (
                                      <span className="border border-gray-300 bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-700">
                                        Selected
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-500 sm:grid-cols-3">
                                    <div>
                                      <span className="block text-gray-400">
                                        Rate
                                      </span>

                                      <span className="mt-0.5 block font-medium text-gray-900">
                                        {courier.rate != null
                                          ? formatCurrency(courier.rate)
                                          : "—"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="block text-gray-400">
                                        Charge Weight
                                      </span>

                                      <span className="mt-0.5 block font-medium text-gray-900">
                                        {courier.chargeWeight != null
                                          ? `${courier.chargeWeight} kg`
                                          : "—"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="block text-gray-400">
                                        ETA
                                      </span>

                                      <span className="mt-0.5 block font-medium text-gray-900">
                                        {courier.etd ||
                                          courier.estimatedDeliveryDate ||
                                          "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border ${
                                    isSelected
                                      ? "border-black bg-black"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="m-1 h-3 w-3 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* GENERATE AWB */}

                      <div className="border-t border-gray-100 pt-5">
                        <button
                          type="button"
                          onClick={handleGenerateAWB}
                          disabled={generatingAWB || !selectedCourierId}
                          className="w-full bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
                        >
                          {generatingAWB
                            ? "Generating AWB..."
                            : "Assign Courier & Generate AWB"}
                        </button>

                        {!selectedCourierId && (
                          <p className="mt-3 text-xs text-gray-500">
                            Select a courier before generating the AWB.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* NO COURIERS */}

                  {!checkingCouriers && couriers.length === 0 && (
                    <div className="mt-5 border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        No courier list loaded
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Click “Check Couriers” to retrieve current Shiprocket
                        availability for this destination.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {shippingStatus === "awb_assigned" && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Schedule Pickup
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        The courier has been assigned. Schedule a pickup for
                        this shipment.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      AWB Assigned
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor="pickupDate"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Pickup Date
                      </label>

                      <input
                        id="pickupDate"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        disabled={schedulingPickup}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        Leave empty to let Shiprocket determine the pickup date.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSchedulePickup}
                      disabled={schedulingPickup}
                      className="inline-flex min-h-11.5 items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {schedulingPickup ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Scheduling...
                        </>
                      ) : (
                        "Schedule Pickup"
                      )}
                    </button>
                  </div>
                </div>
              )}
              {shippingStatus === "pickup_scheduled" && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      ✓
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Pickup Scheduled
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        The shipment pickup has been scheduled with Shiprocket.
                      </p>

                      {order.shipping?.pickupScheduledAt && (
                        <p className="mt-3 text-sm font-medium text-emerald-800">
                          Scheduled:{" "}
                          {new Date(
                            order.shipping.pickupScheduledAt,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <div className="space-y-8">
          {/* CUSTOMER */}

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">Customer</h2>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Name
                </p>

                <p className="mt-2 text-sm text-gray-900">
                  {order.user?.name || order.shippingAddress?.firstName || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Email
                </p>

                <p className="mt-2 break-all text-sm text-gray-900">
                  {order.user?.email || order.shippingAddress?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-gray-400">
                  Phone
                </p>

                <p className="mt-2 text-sm text-gray-900">
                  {order.shippingAddress?.phone || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* SHIPPING ADDRESS */}

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">
                Shipping Address
              </h2>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-700">
                {order.shippingAddress?.firstName}{" "}
                {order.shippingAddress?.lastName}
                <br />
                {order.shippingAddress?.address}
                {order.shippingAddress?.apartment && (
                  <>
                    <br />
                    {order.shippingAddress.apartment}
                  </>
                )}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                <br />
                {order.shippingAddress?.pincode}
                <br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </section>

          {/* UPDATE STATUS */}

          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-medium text-gray-900">
                Update Order
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Change the fulfillment status.
              </p>
            </div>

            <div className="space-y-4 px-6 py-6">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={updating}
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              >
                {ORDER_STATUSES.map((orderStatus) => (
                  <option key={orderStatus} value={orderStatus}>
                    {orderStatus}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating || status === order.orderStatus}
                className="w-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
