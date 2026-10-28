
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");
const VAPID_PUBLIC_KEY = import.meta.env.VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const getOrderId = (notification) => {
  const order = notification?.order;

  if (typeof order === "string") return order;
  return order?._id || null;
};

const formatNotificationDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationLabel = (type) => {
  switch (type) {
    case "NEW_ORDER":
      return "New Order";
    case "ORDER_STATUS":
      return "Order Update";
    case "PAYMENT":
      return "Payment";
    case "SHIPPING":
      return "Shipping Update";
    default:
      return "Notification";
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "NEW_ORDER":
      return "bg-emerald-100 text-emerald-700";
    case "PAYMENT":
      return "bg-blue-100 text-blue-700";
    case "SHIPPING":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  const socketRef = useRef(null);
  const containerRef = useRef(null);
  const notificationIdsRef = useRef(new Set());

  // --------------------------------------------------
  // FETCH ADMIN NOTIFICATIONS
  // --------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      notificationIdsRef.current.clear();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications.");
      }

      const fetchedNotifications = data.notifications || [];

      // Keep IDs already received through Socket.IO so a fetch
      // cannot cause an already-received event to be counted twice.
      fetchedNotifications.forEach((notification) => {
        notificationIdsRef.current.add(notification._id);
      });

      setNotifications((previous) => {
        const combined = new Map();

        fetchedNotifications.forEach((notification) => {
          combined.set(notification._id, notification);
        });

        previous.forEach((notification) => {
          if (!combined.has(notification._id)) {
            combined.set(notification._id, notification);
          }
        });

        return Array.from(combined.values())
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 50);
      });

      // The server's unread count is authoritative after fetching.
      setUnreadCount(
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : fetchedNotifications.filter((item) => !item.isRead).length
      );
    } catch (error) {
      console.error("Failed to fetch admin notifications:", error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --------------------------------------------------
  // REAL-TIME SOCKET.IO NOTIFICATIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("Admin notification socket connected.");
    });

    socket.on("connect_error", (error) => {
      console.error("Admin notification socket error:", error.message);
    });

    socket.on("admin:notification", (notification) => {
      if (!notification?._id) return;

      // Avoid duplicate events and incorrect unread badge counts.
      if (notificationIdsRef.current.has(notification._id)) return;

      notificationIdsRef.current.add(notification._id);

      setNotifications((previous) =>
        [notification, ...previous]
          .filter(
            (item, index, array) =>
              array.findIndex((entry) => entry._id === item._id) === index
          )
          .slice(0, 50)
      );

      if (!notification.isRead) {
        setUnreadCount((previous) => previous + 1);
      }
    });

    return () => {
      socket.off("admin:notification");
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token]);

  // --------------------------------------------------
  // MARK ONE NOTIFICATION AS READ
  // --------------------------------------------------

  const markAsRead = useCallback(
    async (notification) => {
      if (!notification?._id || notification.isRead) return;

      try {
        const response = await fetch(
          `${API_URL}/admin/notifications/${notification._id}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to mark notification as read.");
        }

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(previous - 1, 0));
      } catch (error) {
        console.error("Failed to mark notification as read:", error.message);
      }
    },
    [token]
  );

  // --------------------------------------------------
  // MARK ALL NOTIFICATIONS AS READ
  // --------------------------------------------------

  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark all as read.");
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error.message);
    }
  }, [token, unreadCount]);

  // --------------------------------------------------
  // CLEAR NOTIFICATION WHEN AN ORDER IS VIEWED
  // Keeps compatibility with your AdminOrders component.
  // --------------------------------------------------

  useEffect(() => {
    const handleOrderViewed = (event) => {
      const orderId = event.detail?.orderId;

      if (!orderId) return;

      const matchingNotification = notifications.filter(
        (notification) =>
          getOrderId(notification) === orderId && !notification.isRead
      );

      matchingNotification.forEach((notification) => {
        markAsRead(notification);
      });
    };

    window.addEventListener("admin:order-viewed", handleOrderViewed);

    return () => {
      window.removeEventListener("admin:order-viewed", handleOrderViewed);
    };
  }, [notifications, markAsRead]);

  // --------------------------------------------------
  // CHECK EXISTING BROWSER PUSH SUBSCRIPTION
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const checkPushSubscription = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          return;
        }

        const registration = await navigator.serviceWorker.getRegistration("/");

        if (!registration) return;

        const subscription = await registration.pushManager.getSubscription();

        if (!cancelled) {
          setPushEnabled(Boolean(subscription));
        }
      } catch (error) {
        console.error("Failed to check desktop push subscription:", error.message);
      }
    };

    checkPushSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // ENABLE WINDOWS / DESKTOP PUSH NOTIFICATIONS
  // --------------------------------------------------

  const enableDesktopPush = async () => {
    if (!token) {
      setPushError("Please sign in as an administrator first.");
      return;
    }

    setPushLoading(true);
    setPushError("");

    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("This browser does not support service workers.");
      }

      if (!("PushManager" in window)) {
        throw new Error("This browser does not support push notifications.");
      }

      if (!("Notification" in window)) {
        throw new Error("Browser notifications are not supported.");
      }

      if (!VAPID_PUBLIC_KEY) {
        throw new Error("VAPID_PUBLIC_KEY is missing from your frontend environment.");
      }

      const permission = await window.Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Notifications are blocked. Allow notifications for this website in your browser settings."
        );
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const response = await fetch(
        `${API_URL}/admin/notifications/push/subscribe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription.toJSON()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save your push subscription.");
      }

      setPushEnabled(true);
      setPushError("");
    } catch (error) {
      console.error("Enable desktop push error:", error);
      setPushError(error.message || "Could not enable desktop notifications.");
    } finally {
      setPushLoading(false);
    }
  };

  // --------------------------------------------------
  // CLOSE PANEL WHEN CLICKING OUTSIDE
  // --------------------------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // --------------------------------------------------
  // OPEN NOTIFICATION / NAVIGATE TO ORDER
  // --------------------------------------------------

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification);
    setIsOpen(false);

    const orderId = getOrderId(notification);

    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    } else {
      navigate("/admin/orders");
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,400px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Notifications
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                    title="Mark all as read"
                  >
                    <span className="flex items-center gap-1">
                      <Check size={14} />
                      Read all
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mt-3">
              {pushEnabled ? (
                <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Desktop alerts enabled
                </p>
              ) : (
                <button
                  type="button"
                  onClick={enableDesktopPush}
                  disabled={pushLoading}
                  className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pushLoading
                    ? "Enabling desktop alerts..."
                    : "Enable desktop alerts"}
                </button>
              )}

              {pushError && (
                <p className="mt-2 text-xs leading-5 text-red-600">
                  {pushError}
                </p>
              )}
            </div>
          </div>

          <div className="max-h-105 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto mb-3 text-gray-300" size={30} />
                <p className="text-sm font-medium text-gray-700">
                  You&apos;re all caught up!
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  New order alerts will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    type="button"
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full gap-3 p-4 text-left transition hover:bg-gray-50 ${
                      !notification.isRead ? "bg-emerald-50/50" : "bg-white"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      <Bell size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {notification.title || getNotificationLabel(notification.type)}
                        </span>

                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </span>

                      <span className="mt-1 block text-sm leading-5 text-gray-600">
                        {notification.message || "You have a new notification."}
                      </span>

                      <span className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-400">
                          {formatNotificationDate(notification.createdAt)}
                        </span>

                        {getOrderId(notification) && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            View order
                            <ExternalLink size={12} />
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/admin/orders");
              }}
              className="w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              View all orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
