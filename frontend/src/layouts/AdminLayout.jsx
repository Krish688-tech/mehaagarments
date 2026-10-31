import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AdminNotifications from "../components/admin/AdminNotifications";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 text-sm transition ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-white">
          <div className="flex h-full flex-col">
            {/* BRAND */}

            <div className="flex h-20 items-center border-b border-gray-200 px-6">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="text-left"
              >
                <h1 className="text-xl font-semibold tracking-wide text-gray-900">
                  MEHAA
                </h1>

                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  Admin Panel
                </p>
              </button>
            </div>

            {/* NAVIGATION */}

            <nav className="flex-1 space-y-1 p-4">
              <NavLink to="/admin" end className={navLinkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/admin/products" className={navLinkClass}>
                Products
              </NavLink>

              <NavLink to="/admin/orders" className={navLinkClass}>
                Orders
              </NavLink>

              <NavLink to="/admin/customers" className={navLinkClass}>
                Customers
              </NavLink>

              <NavLink to="/admin/reviews" className={navLinkClass}>
                Reviews
              </NavLink>

              <NavLink to="/admin/categories" className={navLinkClass}>
                Categories
              </NavLink>

              <NavLink to="/admin/unique-categories" className={navLinkClass}>
                Unique Categories
              </NavLink>

              <NavLink to="/admin/newsletter" className={navLinkClass}>
                Newsletter
              </NavLink>
            </nav>

            {/* ADMIN USER */}

            <div className="border-t border-gray-200 p-4">
              <div className="mb-4">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.name || "Admin"}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition hover:border-black hover:text-black"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}

        <main className="ml-64 min-h-screen flex-1">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-8 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Mehaa Garments
              </p>

              <h2 className="mt-1 text-lg font-medium text-gray-900">
                Administration
              </h2>
            </div>

            <div className="flex items-center gap-5">
              <AdminNotifications />

              <div className="text-right">
                <p className="text-xs text-gray-400">Signed in as</p>

                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin"}
                </p>
              </div>
            </div>
          </header>

          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
