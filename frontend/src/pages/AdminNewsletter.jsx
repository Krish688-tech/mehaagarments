
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

import {
  Mail,
  Users,
  UserCheck,
  UserMinus,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdminNewsletter = () => {
  const { token } = useAuth();

  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // ==========================================
  // FETCH SUBSCRIBERS
  // ==========================================

  const fetchSubscribers = async (
    page = pagination.page,
    status = activeTab
  ) => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        status,
      });

      const response = await fetch(
        `${API_URL}/newsletter/admin?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch subscribers"
        );
      }

      setSubscribers(
        Array.isArray(data.subscribers)
          ? data.subscribers
          : []
      );

      setStats({
        total: data.stats?.total || 0,
        active: data.stats?.active || 0,
        unsubscribed: data.stats?.unsubscribed || 0,
      });

      setPagination((previous) => ({
        ...previous,
        ...(data.pagination || {}),
      }));
    } catch (error) {
      console.error("Fetch Newsletter Error:", error);

      setError(
        error.message || "Failed to load newsletter subscribers."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchSubscribers(1, "all");
    }
  }, [token]);

  // ==========================================
  // CHANGE FILTER
  // ==========================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    fetchSubscribers(1, tab);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    fetchSubscribers(page, activeTab);
  };

  // ==========================================
  // SEARCH SUBSCRIBERS
  // Searches the currently loaded page
  // ==========================================

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subscribers;

    return subscribers.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(query)
    );
  }, [subscribers, search]);

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const handleExport = async () => {
    if (stats.active === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Active Subscribers",
        text: "There are no active subscribers to export.",
        confirmButtonColor: "#000000",
      });
    }

    try {
      setExportLoading(true);

      const response = await fetch(
        `${API_URL}/newsletter/admin/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to export subscribers.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "mehaa-newsletter-subscribers.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      await Swal.fire({
        icon: "success",
        title: "Export Successful",
        text: `${stats.active} active subscribers exported successfully.`,
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error("Newsletter Export Error:", error);

      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: error.message || "Unable to export subscribers.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm tracking-wide text-gray-500">
          Loading newsletter subscribers...
        </p>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500">
          Mehaa Garments
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Newsletter Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage your newsletter subscribers and prepare your
              customer email marketing campaigns.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fetchSubscribers(pagination.page, activeTab)}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={exportLoading || loading || stats.active === 0}
              className="flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              {exportLoading ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}

          <button
            type="button"
            onClick={() => fetchSubscribers(pagination.page, activeTab)}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Total Subscribers
            </p>
            <Users size={19} className="text-gray-400" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {stats.total.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            All registered newsletter emails
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Active Subscribers
            </p>
            <UserCheck size={19} className="text-green-600" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {stats.active.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-green-600">
            Eligible for consent-based campaigns
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Unsubscribed
            </p>
            <UserMinus size={19} className="text-gray-400" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {stats.unsubscribed.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            No promotional emails
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Current Page
            </p>
            <Mail size={19} className="text-gray-400" />
          </div>

          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {subscribers.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Subscribers displayed
          </p>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap gap-2">

            {[
              { id: "all", label: "All Subscribers" },
              { id: "active", label: "Active" },
              { id: "unsubscribed", label: "Unsubscribed" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-black"
                }`}
              >
                {tab.label}
              </button>
            ))}

          </div>

          <div className="relative w-full lg:w-96">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search emails on this page..."
              className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black"
            />
          </div>

        </div>

      </div>

      {/* SUBSCRIBER TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Subscriber List
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Manage your newsletter email database.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            {pagination.total} records
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Updating subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Mail size={32} className="mx-auto text-gray-300" />

            <h3 className="mt-4 text-base font-medium text-gray-900">
              No subscribers found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              No newsletter subscribers match your current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 text-left">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      #
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Subscriber Email
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Subscription Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {(pagination.page - 1) * pagination.limit +
                          subscribers.indexOf(subscriber) + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <Mail size={15} className="text-gray-500" />
                          </div>

                          <span className="text-sm font-medium text-gray-800">
                            {subscriber.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(subscriber.subscribedAt)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {subscriber.source === "website_footer"
                          ? "Website Footer"
                          : subscriber.source || "Website"}
                      </td>

                      <td className="px-6 py-4">
                        {subscriber.isSubscribed ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Unsubscribed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-col justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center">

              <p className="text-xs text-gray-500">
                Page {pagination.page} of {pagination.totalPages || 1}
                {" · "}
                {pagination.total} total subscribers
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page >= pagination.totalPages ||
                    loading
                  }
                  className="flex items-center gap-1 border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>
          </>
        )}

      </div>

      {/* FOOTER NOTE */}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <p className="text-xs leading-6 text-gray-500">
          <span className="font-semibold text-gray-700">
            Marketing reminder:
          </span>{" "}
          Only send promotional emails to subscribers with valid marketing
          consent. Always include a working unsubscribe option in every campaign.
        </p>
      </div>

    </div>
  );
};

export default AdminNewsletter;
