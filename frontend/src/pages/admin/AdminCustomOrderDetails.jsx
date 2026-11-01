
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  UserRound,
  Mail,
  CalendarDays,
  Image as ImageIcon,
  ExternalLink,
  Save,
  Loader2,
  Palette,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const statusOptions = [
  { value: "NEW_REQUEST", label: "New Request" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "CONTACTED", label: "Contacted Customer" },
  { value: "QUOTATION_SENT", label: "Quotation Sent" },
  { value: "APPROVED", label: "Customer Approved" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminCustomOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [customOrder, setCustomOrder] = useState(null);
  const [status, setStatus] = useState("NEW_REQUEST");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH REQUEST DETAILS
  // ==========================================

  const fetchDetails = useCallback(async () => {
    if (!token || !id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/custom-orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch request details.");
      }

      const order = data.customOrder;

      setCustomOrder(order);
      setStatus(order.status);
      setAdminNotes(order.adminNotes || "");
    } catch (fetchError) {
      console.error("Custom order detail error:", fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ==========================================
  // SAVE STATUS AND ADMIN NOTES
  // ==========================================

  const handleSave = async () => {
    if (!token || !customOrder) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/custom-orders/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            adminNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update custom order.");
      }

      setCustomOrder(data.customOrder);

      await Swal.fire({
        icon: "success",
        title: "Changes Saved",
        text: "Custom saree request has been updated successfully.",
        confirmButtonColor: "#111827",
        confirmButtonText: "Continue",
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (saveError) {
      console.error("Custom order update error:", saveError);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: saveError.message || "Please try again.",
        confirmButtonColor: "#111827",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 size={30} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !customOrder) {
    return (
      <div className="border border-red-200 bg-white p-8 text-center">
        <p className="text-sm text-red-600">
          {error || "Custom order not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/admin/custom-orders")}
          className="mt-5 border border-gray-300 px-4 py-2 text-sm hover:border-black"
        >
          Back to Custom Orders
        </button>
      </div>
    );
  }

  const customer = customOrder.customer || {};

  return (
    <div className="mx-auto max-w-6xl space-y-7">

      {/* HEADER */}

      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/custom-orders")}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Custom Orders
        </button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Custom Pattu Studio / Request Details
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              Custom Saree Request
            </h1>

            <p className="mt-1 font-mono text-xs text-gray-400">
              ID: {customOrder._id}
            </p>
          </div>

          <span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">
            {statusOptions.find((item) => item.value === customOrder.status)?.label ||
              customOrder.status}
          </span>
        </div>
      </div>

      {/* CUSTOMER INFORMATION */}

      <section className="border border-gray-200 bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
          <UserRound size={19} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Customer Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Customer Name</p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {customer.name || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Email Address</p>

            <a
              href={customer.email ? `mailto:${customer.email}` : undefined}
              className="mt-2 flex items-center gap-2 text-sm text-gray-800 hover:underline"
            >
              <Mail size={15} />
              {customer.email || "Not available"}
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-400">Submitted On</p>

            <p className="mt-2 flex items-center gap-2 text-sm text-gray-800">
              <CalendarDays size={15} />
              {formatDate(customOrder.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {/* DESIGN PREFERENCES */}

      <section className="border border-gray-200 bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Palette size={19} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Saree Design Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400">Zari Preference</p>

            <p className="mt-2 text-sm font-semibold text-gray-900">
              {customOrder.zariType === "gold" ? "Gold Zari" : "Silver Zari"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Preferred Colour</p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {customOrder.preferredColor || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">Occasion</p>

            <p className="mt-2 text-sm font-medium text-gray-900">
              {customOrder.occasion || "Not specified"}
            </p>
          </div>
        </div>
      </section>

      {/* REFERENCE IMAGES */}

      <section className="border border-gray-200 bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={19} className="text-gray-500" />

            <h2 className="font-semibold text-gray-900">
              Customer Reference Images
            </h2>
          </div>

          <span className="text-xs text-gray-400">
            {customOrder.referenceImages?.length || 0} Images
          </span>
        </div>

        {customOrder.referenceImages?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {customOrder.referenceImages.map((image, index) => (
              <a
                key={image.publicId || image.url}
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden border border-gray-200 bg-gray-50"
              >
                <img
                  src={image.url}
                  alt={`Customer design reference ${index + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition group-hover:bg-black/30">
                  <ExternalLink
                    size={22}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">
            Customer has not uploaded any reference images.
          </p>
        )}
      </section>

      {/* CUSTOMER DESIGN DESCRIPTION */}

      <section className="border border-gray-200 bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
          <FileText size={19} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Customer's Dream Saree Description
          </h2>
        </div>

        <div className="whitespace-pre-wrap text-sm leading-8 text-gray-700">
          {customOrder.designDescription}
        </div>
      </section>

      {/* ADMIN MANAGEMENT */}

      <section className="border border-gray-200 bg-white p-5 sm:p-7">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Custom Request
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Update the request progress and add private internal notes.
          </p>
        </div>

        <div className="space-y-6">

          <div>
            <label
              htmlFor="customOrderStatus"
              className="mb-2 block text-xs font-medium text-gray-700"
            >
              Request Status
            </label>

            <select
              id="customOrderStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black sm:max-w-md"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="adminNotes"
              className="mb-2 block text-xs font-medium text-gray-700"
            >
              Internal Admin Notes
            </label>

            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={5}
              maxLength={3000}
              placeholder="Add internal notes about design discussions, pricing, customer communication, production instructions..."
              className="w-full resize-y border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-black"
            />

            <p className="mt-2 text-right text-[10px] text-gray-400">
              {adminNotes.length}/3000
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Internal notes are visible to administrators only.
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AdminCustomOrderDetails;
