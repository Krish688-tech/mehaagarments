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
  Plus,
  X,
  Eye,
  ArrowUpRight,
  History,
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
  // CAMPAIGN EDITOR
  // ==========================================

  const [showCampaignEditor, setShowCampaignEditor] = useState(false);
  const [showCampaignPreview, setShowCampaignPreview] = useState(false);

  const [campaignId, setCampaignId] = useState(null);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignSending, setCampaignSending] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState("");
  const [campaignProgress, setCampaignProgress] = useState(null);
  // ==========================================
  // CAMPAIGN HISTORY & DASHBOARD
  // ==========================================

  const [campaignHistory, setCampaignHistory] = useState([]);
  const [campaignHistoryLoading, setCampaignHistoryLoading] = useState(false);
  const [campaignHistoryError, setCampaignHistoryError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [campaignDetailsLoading, setCampaignDetailsLoading] = useState(false);
  const [campaignDetailsError, setCampaignDetailsError] = useState("");
  const [campaignHistoryTotal, setCampaignHistoryTotal] = useState(0);
  const [showCampaignHistory, setShowCampaignHistory] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    campaignName: "",
    subject: "",
    previewText: "",
    bannerUrl: "",
    heading: "",
    message: "",
    buttonText: "EXPLORE COLLECTION",
    buttonUrl: "https://mehaagarments.in/collections",
  });

  const handleCampaignChange = (event) => {
    const { name, value } = event.target;

    setCampaignForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetCampaignEditor = () => {
    setCampaignForm({
      campaignName: "",
      subject: "",
      previewText: "",
      bannerUrl: "",
      heading: "",
      message: "",
      buttonText: "EXPLORE COLLECTION",
      buttonUrl: "https://mehaagarments.in/collections",
    });

    setCampaignId(null);
    setCampaignStatus("");
    setCampaignSaving(false);
    setCampaignSending(false);
    setShowCampaignPreview(false);
    setShowCampaignEditor(false);
  };

  // ==========================================
  // CAMPAIGN API
  // ==========================================

  const campaignHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const saveCampaignDraft = async () => {
    if (!token) {
      throw new Error("Admin authentication required.");
    }

    const requiredFields = [
      ["campaignName", "Campaign name"],
      ["subject", "Email subject"],
      ["heading", "Main heading"],
      ["message", "Promotional message"],
    ];

    for (const [field, label] of requiredFields) {
      if (!campaignForm[field]?.trim()) {
        throw new Error(`${label} is required.`);
      }
    }

    const response = await fetch(`${API_URL}/newsletter-campaigns/create`, {
      method: "POST",
      headers: campaignHeaders,
      body: JSON.stringify(campaignForm),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save campaign.");
    }

    const savedCampaign = data.campaign || data;

    if (!savedCampaign._id) {
      throw new Error("Campaign saved, but the campaign ID was not returned.");
    }

    setCampaignId(savedCampaign._id);
    setCampaignStatus(savedCampaign.status || "draft");

    return savedCampaign;
  };

  const handleSaveDraft = async () => {
    try {
      setCampaignSaving(true);

      const campaign = await saveCampaignDraft();

      await Swal.fire({
        icon: "success",
        title: "Draft Saved",
        text: `${campaign.campaignName || campaignForm.campaignName} has been saved successfully.`,
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to Save",
        text: error.message,
        confirmButtonColor: "#000000",
      });
    } finally {
      setCampaignSaving(false);
    }
  };

  const handleStartCampaign = async () => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Start Email Campaign?",
      text: "This will prepare the campaign for all active subscribers who have given marketing consent.",
      showCancelButton: true,
      confirmButtonText: "Yes, Start Campaign",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#000000",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setCampaignSending(true);

      let id = campaignId;

      // Save campaign first if it has not been saved.
      if (!id) {
        const campaign = await saveCampaignDraft();
        id = campaign._id;
      }

      const response = await fetch(
        `${API_URL}/newsletter-campaigns/${id}/start`,
        {
          method: "POST",
          headers: campaignHeaders,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start campaign.");
      }

      setCampaignStatus(data.campaign?.status || "sending");

      await fetchCampaignHistory();

      await Swal.fire({
        icon: "success",
        title: "Campaign Prepared",
        text: data.message || "Your campaign is ready for batch sending.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Campaign Error",
        text: error.message,
        confirmButtonColor: "#000000",
      });
    } finally {
      setCampaignSending(false);
    }
  };

  const handleSendBatch = async () => {
    if (!campaignId) return;

    try {
      setCampaignSending(true);

      const response = await fetch(
        `${API_URL}/newsletter-campaigns/${campaignId}/send-batch`,
        {
          method: "POST",
          headers: campaignHeaders,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send campaign batch.");
      }

      const campaign = data.campaign || {};

      if (campaign.status) {
        setCampaignStatus(campaign.status);
      }

      if (data.progress) {
        setCampaignProgress(data.progress);
      }

      if (data.campaign?.status) {
        setCampaignStatus(data.campaign.status);
      }

      await fetchCampaignHistory();

      await Swal.fire({
        icon: "success",
        title: "Batch Processed",
        text: data.message || "The next batch has been processed.",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Sending Error",
        text: error.message,
        confirmButtonColor: "#000000",
      });
    } finally {
      setCampaignSending(false);
    }
  };

  // ==========================================
  // FETCH CAMPAIGN HISTORY
  // ==========================================

  const fetchCampaignHistory = async () => {
    if (!token) return;

    try {
      setCampaignHistoryLoading(true);
      setCampaignHistoryError("");

      const response = await fetch(
        `${API_URL}/newsletter-campaigns/admin?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load campaign history.");
      }

      setCampaignHistory(Array.isArray(data.campaigns) ? data.campaigns : []);

      setCampaignHistoryTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("CAMPAIGN HISTORY ERROR:", error);
      setCampaignHistoryError(error.message);
    } finally {
      setCampaignHistoryLoading(false);
    }
  };

  // ==========================================
  // FETCH CAMPAIGN DETAILS
  // ==========================================

  const fetchCampaignDetails = async (campaignId) => {
    if (!token || !campaignId) return;

    try {
      setSelectedCampaign(campaignId);
      setCampaignDetailsLoading(true);
      setCampaignDetailsError("");
      setCampaignDetails(null);

      const response = await fetch(
        `${API_URL}/newsletter-campaigns/admin/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load campaign details.");
      }

      setCampaignDetails(data);
    } catch (error) {
      console.error("CAMPAIGN DETAILS ERROR:", error);
      setCampaignDetailsError(error.message);
    } finally {
      setCampaignDetailsLoading(false);
    }
  };

  // ==========================================
  // CAMPAIGN PROGRESS HELPERS
  // ==========================================

  const getCampaignProgress = (campaign) => {
    const total = Number(campaign.totalRecipients || 0);
    const sent = Number(campaign.sentCount || 0);
    const failed = Number(campaign.failedCount || 0);

    if (!total) return 0;

    return Math.min(100, Math.round(((sent + failed) / total) * 100));
  };

  const getCampaignStatusStyle = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-700",
      sending: "bg-blue-50 text-blue-700",
      completed: "bg-green-50 text-green-700",
      partially_completed: "bg-amber-50 text-amber-700",
      failed: "bg-red-50 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatCampaignStatus = (status) => {
    return String(status || "unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ==========================================
  // FETCH SUBSCRIBERS
  // ==========================================

  const fetchSubscribers = async (
    page = pagination.page,
    status = activeTab,
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch subscribers");
      }

      setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []);

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

      setError(error.message || "Failed to load newsletter subscribers.");
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
  // INITIAL CAMPAIGN HISTORY LOAD
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchCampaignHistory();
    }
  }, [token]);

  // ==========================================
  // AUTO REFRESH WHILE CAMPAIGNS ARE SENDING
  // ==========================================

  useEffect(() => {
    const hasSendingCampaign = campaignHistory.some(
      (campaign) => campaign.status === "sending",
    );

    if (!token || !hasSendingCampaign) return;

    const interval = setInterval(() => {
      fetchCampaignHistory();
    }, 15000);

    return () => clearInterval(interval);
  }, [token, campaignHistory]);

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
    if (page < 1 || page > pagination.totalPages || page === pagination.page) {
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
      subscriber.email.toLowerCase().includes(query),
    );
  }, [subscribers, search]);

  // ==========================================
  // EXPORT CSV — ALL SUBSCRIBERS
  // ==========================================

  const handleExport = async () => {
    if (stats.total === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Subscribers",
        text: "There are no subscriber records to export.",
        confirmButtonColor: "#000000",
      });
    }

    try {
      setExportLoading(true);

      const response = await fetch(`${API_URL}/newsletter/admin/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        text: `${stats.total} subscriber records exported successfully.`,
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      {/* ========================================== */}
      {/* NEWSLETTER MANAGEMENT DASHBOARD */}
      {/* ========================================== */}

      {!showCampaignHistory && (
        <>
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
                  Manage your newsletter subscribers and prepare your customer
                  email marketing campaigns.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignEditor(true)}
                  className="flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Plus size={17} />
                  Create Campaign
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCampaignHistory(true);
                    fetchCampaignHistory();
                  }}
                  className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
                >
                  <History size={16} />
                  Campaign History
                </button>

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
                  disabled={exportLoading || loading || stats.total === 0}
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
                      {filteredSubscribers.map((subscriber) => (
                        <tr
                          key={subscriber._id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {(pagination.page - 1) * pagination.limit +
                              subscribers.indexOf(subscriber) +
                              1}
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
                        pagination.page >= pagination.totalPages || loading
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

          {/* MARKETING REMINDER */}

          <div className="mt-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
            <p className="text-xs leading-6 text-gray-500">
              <span className="font-semibold text-gray-700">
                Marketing reminder:
              </span>{" "}
              Only send promotional emails to subscribers with valid marketing
              consent. Always include a working unsubscribe option in every
              campaign.
            </p>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* CAMPAIGN HISTORY DASHBOARD */}
      {/* ========================================== */}

      {showCampaignHistory && (
        <>
          {/* HISTORY HEADER */}

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
                Mehaa Garments · Email Marketing
              </p>

              <h2 className="mt-2 text-xl font-semibold text-gray-900 md:text-2xl">
                Campaign History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Monitor your previous campaigns and email delivery performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchCampaignHistory}
                disabled={campaignHistoryLoading}
                className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-black disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={campaignHistoryLoading ? "animate-spin" : ""}
                />
                Refresh History
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCampaignHistory(false);
                  setSelectedCampaign(null);
                  setCampaignDetails(null);
                  setCampaignDetailsError("");
                }}
                className="flex items-center justify-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <ChevronLeft size={16} />
                Back to Newsletter
              </button>
            </div>
          </div>

          {/* HISTORY SUMMARY */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Total Campaigns
              </p>

              <p className="mt-3 text-2xl font-semibold text-gray-900">
                {campaignHistoryTotal}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Total saved campaigns
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Currently Sending
              </p>

              <p className="mt-3 text-2xl font-semibold text-blue-700">
                {
                  campaignHistory.filter((item) => item.status === "sending")
                    .length
                }
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Campaigns in progress
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Completed Campaigns
              </p>

              <p className="mt-3 text-2xl font-semibold text-green-700">
                {
                  campaignHistory.filter((item) =>
                    ["completed", "partially_completed"].includes(item.status),
                  ).length
                }
              </p>

              <p className="mt-1 text-xs text-gray-400">Processed campaigns</p>
            </div>
          </div>

          {/* HISTORY ERROR */}

          {campaignHistoryError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {campaignHistoryError}

              <button
                type="button"
                onClick={fetchCampaignHistory}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* PREVIOUS CAMPAIGNS */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-5">
              <h3 className="text-base font-semibold text-gray-900">
                Previous Campaigns
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Select a campaign to view its delivery statistics.
              </p>
            </div>

            {campaignHistoryLoading && campaignHistory.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                Loading campaign history...
              </div>
            ) : campaignHistory.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Mail size={34} className="mx-auto text-gray-300" />

                <h3 className="mt-4 text-base font-medium text-gray-900">
                  No campaigns yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Your saved and sent campaigns will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {campaignHistory.map((campaign) => {
                  const progress = getCampaignProgress(campaign);

                  return (
                    <div
                      key={campaign._id}
                      className="p-5 transition hover:bg-gray-50"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {campaign.campaignName}
                            </h4>

                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold ${getCampaignStatusStyle(campaign.status)}`}
                            >
                              {formatCampaignStatus(campaign.status)}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            {campaign.subject}
                          </p>

                          <p className="mt-2 text-xs text-gray-400">
                            Created: {formatDate(campaign.createdAt)}
                            {" · "}
                            {Number(
                              campaign.totalRecipients || 0,
                            ).toLocaleString("en-IN")}{" "}
                            recipients
                          </p>
                        </div>

                        <div className="w-full lg:max-w-xs">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">
                              Delivery progress
                            </span>

                            <span className="text-xs font-semibold text-gray-800">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                campaign.status === "failed"
                                  ? "bg-red-500"
                                  : campaign.status === "partially_completed"
                                    ? "bg-amber-500"
                                    : "bg-green-600"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="mt-2 flex justify-between gap-3 text-[11px]">
                            <span className="text-green-700">
                              {campaign.sentCount || 0} sent
                            </span>

                            <span className="text-red-600">
                              {campaign.failedCount || 0} failed
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => fetchCampaignDetails(campaign._id)}
                          className="flex shrink-0 items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-black hover:text-black"
                        >
                          <Eye size={15} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SELECTED CAMPAIGN REPORT */}

          {selectedCampaign && (
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Campaign Report
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {campaignDetails?.campaign?.campaignName ||
                      "Campaign Details"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fetchCampaignDetails(selectedCampaign)}
                    disabled={campaignDetailsLoading}
                    className="flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:border-black disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={campaignDetailsLoading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setCampaignDetails(null);
                      setCampaignDetailsError("");
                    }}
                    className="flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:border-black"
                  >
                    <X size={14} />
                    Close
                  </button>
                </div>
              </div>

              {campaignDetailsLoading ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Loading campaign report...
                </div>
              ) : campaignDetailsError ? (
                <div className="p-5 text-sm text-red-600">
                  {campaignDetailsError}
                </div>
              ) : campaignDetails?.campaign ? (
                <div className="p-5">
                  <div className="mb-5">
                    <p className="text-xs text-gray-500">
                      Subject: {campaignDetails.campaign.subject}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Started: {formatDate(campaignDetails.campaign.startedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        label: "Total Recipients",
                        value: campaignDetails.campaign.totalRecipients || 0,
                        style: "text-gray-900",
                      },
                      {
                        label: "Sent",
                        value: campaignDetails.statistics?.sent || 0,
                        style: "text-green-700",
                      },
                      {
                        label: "Failed",
                        value: campaignDetails.statistics?.failed || 0,
                        style: "text-red-600",
                      },
                      {
                        label: "Pending",
                        value: campaignDetails.statistics?.pending || 0,
                        style: "text-amber-600",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                          {item.label}
                        </p>

                        <p
                          className={`mt-2 text-2xl font-semibold ${item.style}`}
                        >
                          {Number(item.value).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-700">
                      Delivery Breakdown
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      <p className="text-gray-500">
                        Skipped:{" "}
                        <span className="font-semibold text-gray-800">
                          {campaignDetails.statistics?.skipped || 0}
                        </span>
                      </p>

                      <p className="text-gray-500">
                        Pending:{" "}
                        <span className="font-semibold text-gray-800">
                          {campaignDetails.statistics?.pending || 0}
                        </span>
                      </p>

                      <p className="text-gray-500">
                        Processing:{" "}
                        <span className="font-semibold text-gray-800">
                          {campaignDetails.statistics?.processing || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* HISTORY FOOTER */}

          <div className="mt-6 rounded-lg border border-gray-200 bg-white px-5 py-4">
            <p className="text-xs leading-6 text-gray-500">
              <span className="font-semibold text-gray-700">
                Marketing reminder:
              </span>{" "}
              Only send promotional emails to subscribers with valid marketing
              consent. Always include a working unsubscribe option in every
              campaign.
            </p>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* CAMPAIGN CREATION MODAL */}
      {/* KEEP OUTSIDE BOTH DASHBOARD CONDITIONS */}
      {/* ========================================== */}

      {showCampaignEditor && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm md:p-6">
          <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 md:px-7">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400">
                  Mehaa Garments
                </p>

                <h2 className="mt-1 text-lg font-semibold text-gray-900 md:text-xl">
                  Create Email Campaign
                </h2>
              </div>

              <button
                type="button"
                onClick={resetCampaignEditor}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                aria-label="Close campaign editor"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-2">
              {/* LEFT: EDITOR */}

              <div className="space-y-5 border-b border-gray-200 p-5 md:p-7 lg:border-b-0 lg:border-r">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Campaign Details
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Configure your promotional email content.
                  </p>
                </div>

                {/* CAMPAIGN NAME */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Campaign Name
                  </label>

                  <input
                    type="text"
                    name="campaignName"
                    value={campaignForm.campaignName}
                    onChange={handleCampaignChange}
                    placeholder="Example: New Silk Collection"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* EMAIL SUBJECT */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Email Subject
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={campaignForm.subject}
                    onChange={handleCampaignChange}
                    placeholder="Discover Our Latest Saree Collection"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* PREVIEW TEXT */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Inbox Preview Text
                  </label>

                  <input
                    type="text"
                    name="previewText"
                    value={campaignForm.previewText}
                    onChange={handleCampaignChange}
                    placeholder="Beautiful sarees selected just for you..."
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Email Design
                  </h3>
                </div>

                {/* BANNER IMAGE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Banner Image URL
                  </label>

                  <input
                    type="url"
                    name="bannerUrl"
                    value={campaignForm.bannerUrl}
                    onChange={handleCampaignChange}
                    placeholder="https://example.com/banner.webp"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />

                  <p className="mt-2 text-[11px] text-gray-400">
                    Use a publicly accessible HTTPS image URL.
                  </p>
                </div>

                {/* HEADING */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Main Heading
                  </label>

                  <input
                    type="text"
                    name="heading"
                    value={campaignForm.heading}
                    onChange={handleCampaignChange}
                    placeholder="A Little Elegance, Just for You"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                {/* MESSAGE */}

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Promotional Message
                  </label>

                  <textarea
                    name="message"
                    value={campaignForm.message}
                    onChange={handleCampaignChange}
                    rows={5}
                    placeholder="Discover timeless sarees that make every moment special. Explore our latest collection..."
                    className="w-full resize-y border border-gray-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-black"
                  />
                </div>

                {/* CTA BUTTON */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-gray-600">
                      Button Text
                    </label>

                    <input
                      type="text"
                      name="buttonText"
                      value={campaignForm.buttonText}
                      onChange={handleCampaignChange}
                      placeholder="SHOP NOW"
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-gray-600">
                      Button Destination URL
                    </label>

                    <input
                      type="url"
                      name="buttonUrl"
                      value={campaignForm.buttonUrl}
                      onChange={handleCampaignChange}
                      placeholder="https://mehaagarments.in/collections"
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: LIVE PREVIEW */}

              <div className="bg-gray-50 p-5 md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Email Preview
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Preview your promotional email.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCampaignPreview(!showCampaignPreview)}
                    className="flex items-center gap-2 border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-black"
                  >
                    <Eye size={15} />
                    {showCampaignPreview ? "Live Preview" : "Refresh Preview"}
                  </button>
                </div>

                {/* EMAIL MOCKUP */}

                <div className="mx-auto max-w-120 overflow-hidden border border-gray-200 bg-white shadow-sm">
                  {/* BRAND HEADER */}

                  <div className="bg-[#111111] px-5 py-7 text-center">
                    <h1 className="font-serif text-4xl italic tracking-wide text-white">
                      Mehaa
                    </h1>

                    <p className="mt-2 text-[9px] uppercase tracking-[0.35em] text-gray-400">
                      ELEGANCE IN EVERY SAREE
                    </p>
                  </div>

                  {/* BANNER */}

                  {campaignForm.bannerUrl && (
                    <div className="bg-gray-100">
                      <img
                        src={campaignForm.bannerUrl}
                        alt="Campaign banner"
                        className="block max-h-65 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* EMAIL CONTENT */}

                  <div className="px-6 py-9 text-center">
                    <h2 className="font-serif text-2xl leading-relaxed text-gray-900">
                      {campaignForm.heading ||
                        "A Little Elegance, Just for You"}
                    </h2>

                    <div className="mx-auto my-5 h-px w-12 bg-gray-300" />

                    <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                      {campaignForm.message ||
                        "Discover timeless sarees that make every moment special. Explore our latest collection, thoughtfully selected for everyday elegance and special occasions."}
                    </p>

                    {campaignForm.buttonText && (
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-2 bg-black px-7 py-4 text-[10px] font-semibold tracking-[0.15em] text-white">
                          {campaignForm.buttonText.toUpperCase()}
                          <ArrowUpRight size={14} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* EMAIL FOOTER */}

                  <div className="border-t border-gray-200 bg-gray-50 px-5 py-7 text-center">
                    <p className="font-serif text-lg text-gray-800">
                      Mehaa Garments
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-gray-500">
                      Thank you for being part of our journey.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500">
                      <a
                        href="/unsubscribe-preview"
                        className="underline hover:text-black"
                      >
                        Unsubscribe
                      </a>

                      <span>|</span>

                      <a
                        href="https://mehaagarments.in/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black"
                      >
                        Privacy Policy
                      </a>

                      <span>|</span>

                      <a
                        href="https://mehaagarments.in/contact-us"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-black"
                      >
                        Contact Us
                      </a>
                    </div>

                    <p className="mt-3 text-[9px] text-gray-400">
                      © {new Date().getFullYear()} Mehaa Garments
                    </p>
                  </div>
                </div>

                {/* INBOX PREVIEW */}

                <div className="mx-auto mt-5 max-w-120 space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Inbox Preview
                  </p>

                  <p className="text-sm font-semibold text-gray-800">
                    {campaignForm.subject ||
                      "Your email subject will appear here"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {campaignForm.previewText ||
                      "Your preview text will appear here"}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center md:px-7">
              <div>
                <p className="text-xs text-gray-500">
                  {campaignStatus === "sending"
                    ? "Campaign prepared. Ready for batch sending."
                    : campaignId
                      ? "Campaign draft saved."
                      : "Save your campaign before sending."}
                </p>

                {campaignId && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    Campaign ID: {campaignId}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={resetCampaignEditor}
                  disabled={campaignSaving || campaignSending}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-black hover:text-black disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => setShowCampaignPreview(!showCampaignPreview)}
                  className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-black"
                >
                  <Eye size={16} />
                  Preview
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={campaignSaving || campaignSending}
                  className="flex items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {campaignSaving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  onClick={handleStartCampaign}
                  disabled={
                    campaignSaving ||
                    campaignSending ||
                    campaignStatus === "sending"
                  }
                  className="flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {campaignSending
                    ? "Preparing..."
                    : campaignStatus === "sending"
                      ? "Campaign Prepared"
                      : "Prepare Campaign"}
                </button>

                {campaignId && campaignStatus === "sending" && (
                  <button
                    type="button"
                    onClick={handleSendBatch}
                    disabled={campaignSending || campaignSaving}
                    className="flex items-center justify-center gap-2 bg-green-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {campaignSending ? "Sending Batch..." : "Send Next Batch"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
