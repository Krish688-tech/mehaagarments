import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoice = async () => {
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
        throw new Error(data.message || "Failed to fetch invoice");
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Invoice fetch error:", error);
      setError(error.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchInvoice();
    }
  }, [token, id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading invoice...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}`)}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Order
        </button>

        <div className="border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  const subtotal = order.orderItems?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  ) || 0;

  return (
    <>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate(`/admin/orders/${id}`)}
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Order
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Print / Save PDF
        </button>
      </div>

      <div className="mx-auto max-w-4xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-gray-200 pb-8">
          <div>
            <div className="mb-4">
              <img
                src="/mehaa-logo.png"
                alt="Mehaa Garments"
                className="h-24 w-auto object-contain"
              />
            </div>

            <h1 className="text-2xl font-serif tracking-wide text-gray-900">
              MEHAA GARMENTS
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Chrompet, Chennai
              <br />
              Chennai, Tamil Nadu - 600044
              <br />
              Phone: 7418541436
              <br />
              Email: Mehaagarments@gmail.com
              <br />
              Website: www.MehaaGarments.in
            </p>

            <p className="mt-3 text-sm font-medium text-gray-900">
              GSTIN: 33ABEFG9524G1ZG
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
              Tax Invoice
            </p>

            <h2 className="mt-3 text-2xl font-medium text-gray-900">
              {order.invoice?.invoiceNumber || "Invoice Pending"}
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Invoice Date:{" "}
              {formatDate(order.invoice?.issuedAt || order.createdAt)}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Order ID: #{order._id}
            </p>
          </div>
        </div>

        {/* CUSTOMER */}

        <div className="grid grid-cols-1 gap-8 border-b border-gray-200 py-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Bill To
            </p>

            <p className="mt-3 text-sm font-medium text-gray-900">
              {order.user?.name ||
                order.shippingAddress?.firstName ||
                "Customer"}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {order.shippingAddress?.email ||
                order.user?.email ||
                "—"}
              <br />
              {order.shippingAddress?.phone || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Shipping Address
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-700">
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
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state}
              <br />
              {order.shippingAddress?.pincode}
              <br />
              {order.shippingAddress?.country}
            </p>
          </div>
        </div>

        {/* ITEMS */}

        <div className="py-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.15em] text-gray-500">
                  #
                </th>

                <th className="px-3 py-3 text-left text-xs uppercase tracking-[0.15em] text-gray-500">
                  Product
                </th>

                <th className="px-3 py-3 text-center text-xs uppercase tracking-[0.15em] text-gray-500">
                  Qty
                </th>

                <th className="px-3 py-3 text-right text-xs uppercase tracking-[0.15em] text-gray-500">
                  Price
                </th>

                <th className="px-3 py-3 text-right text-xs uppercase tracking-[0.15em] text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {order.orderItems?.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100"
                >
                  <td className="px-3 py-4 text-sm text-gray-600">
                    {index + 1}
                  </td>

                  <td className="px-3 py-4 text-sm font-medium text-gray-900">
                    {item.name}
                  </td>

                  <td className="px-3 py-4 text-center text-sm text-gray-600">
                    {item.quantity}
                  </td>

                  <td className="px-3 py-4 text-right text-sm text-gray-600">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}

        <div className="flex justify-end border-b border-gray-200 pb-8">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-medium text-gray-900">
              <span>Grand Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}

        <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Payment Information
            </p>

            <p className="mt-3 text-sm text-gray-700">
              Method:{" "}
              <span className="font-medium capitalize">
                {order.paymentMethod}
              </span>
            </p>

            <p className="mt-1 text-sm text-gray-700">
              Status:{" "}
              <span className="font-medium capitalize">
                {order.paymentStatus}
              </span>
            </p>

            {order.paymentResult?.razorpay_payment_id && (
              <p className="mt-1 break-all text-sm text-gray-700">
                Payment ID:{" "}
                {order.paymentResult.razorpay_payment_id}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Thank You
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Thank you for shopping with Mehaa Garments.
              <br />
              We appreciate your business.
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-400">
            This is a computer-generated invoice and does not require a signature.
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Mehaa Garments · Chrompet, Chennai, Tamil Nadu - 600044
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminInvoice;