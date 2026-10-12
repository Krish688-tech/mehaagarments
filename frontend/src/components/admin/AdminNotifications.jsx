import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const containerRef = useRef(null);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch notifications",
        );
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to fetch admin notifications:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ==========================================
  // SOCKET.IO CONNECTION
  // ==========================================

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "Admin notification socket connected:",
        socket.id,
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Admin notification socket error:",
        error.message,
      );
    });

    socket.on("admin:notification", (notification) => {
      setNotifications((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === notification._id,
        );

        if (alreadyExists) {
          return previous;
        }

        return [notification, ...previous].slice(0, 50);
      });

      setUnreadCount((previous) => previous + 1);
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "Admin notification socket disconnected:",
        reason,
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ==========================================
  // CLOSE WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const markAsRead = async (notification) => {
    if (notification.isRead) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/notifications/${notification._id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification",
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item,
        ),
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notifications",
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );
    }
  };

  // ==========================================
  // OPEN NOTIFICATION
  // ==========================================

  const handleNotificationClick = async (
    notification,
  ) => {
    await markAsRead(notification);

    setIsOpen(false);

    if (notification.order?._id) {
      navigate(
        `/admin/orders/${notification.order._id}`,
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* BELL BUTTON */}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-black"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION PANEL */}

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-95 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-lg px-2.5 py-2 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-black"
                >
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* NOTIFICATION LIST */}

          <div className="max-h-105 overflow-y-auto">
            {loading ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Bell
                    size={20}
                    className="text-gray-400"
                  />
                </div>

                <p className="text-sm font-medium text-gray-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  New orders will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className={`group flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 ${
                    !notification.isRead
                      ? "bg-gray-50/80"
                      : "bg-white"
                  }`}
                >
                  {/* STATUS DOT */}

                  <div className="mt-1.5 shrink-0">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        notification.isRead
                          ? "bg-gray-200"
                          : "bg-black"
                      }`}
                    />
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>

                      {!notification.isRead && (
                        <span className="mt-1 shrink-0 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                      {notification.message}
                    </p>

                    {notification.order && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                        <span>
                          Order #
                          {notification.order._id.slice(-8)}
                        </span>

                        <ExternalLink
                          size={11}
                          className="opacity-0 transition group-hover:opacity-100"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/admin/orders");
                }}
                className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-600 transition hover:text-black"
              >
                View all orders
                <Check size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;