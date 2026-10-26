import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, token, isAuthenticated, logout } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    logout();

    setProfileOpen(false);
    setMenuOpen(false);

    await Swal.fire({
      icon: "success",
      title: "Logout Successful",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        if (!isAuthenticated || !token) {
          setCartCount(0);
          return;
        }

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const items = Array.isArray(data?.cart?.items) ? data.cart.items : [];

        const totalItems = items.reduce(
          (acc, item) => acc + Number(item.quantity || 0),
          0,
        );

        setCartCount(totalItems);

        // Keep localStorage synchronized with MongoDB
        const localCart = items
          .filter((item) => item.product)
          .map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }));

        localStorage.setItem("cartItems", JSON.stringify(localCart));
      } catch (error) {
        console.error("Navbar cart count error:", error);
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, [isAuthenticated, token]);

  return (
    <>
      {/* NAVBAR */}
      <div
        data-site-navbar
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 md:px-10 py-2.5 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        {/* Logo */}

        <Link to="/" className="inline-block">
          <h1 className="font-['Pinyon_Script'] text-3xl font-normal leading-none tracking-normal text-[#2b2b2b] sm:text-4xl">
            Mehaa
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>

          <Link to="/shop" className="hover:text-black transition">
            Collections
          </Link>

          <Link to="/contact-us" className="hover:text-black transition">
            Contact
          </Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4 relative">
          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="relative"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={24} />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* Profile */}
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold uppercase"
                aria-label="Open profile menu"
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute top-14 right-0 bg-white shadow-xl rounded-2xl p-4 min-w-60 border border-gray-100">
                  <div className="border-b border-gray-100 pb-3">
                    <p className="text-sm font-medium text-gray-800">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 break-all">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/account");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 transition mt-2"
                  >
                    My Account
                  </button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    My Orders
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 transition text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Login */}
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-700 hover:text-black transition"
              >
                Login
              </button>

              {/* Register */}
              <button
                onClick={() => navigate("/register")}
                className="bg-black text-white px-5 py-2 rounded-full text-sm hover:scale-105 transition duration-300"
              >
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden text-black"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 right-0 h-screen w-[88%] max-w-95 bg-white z-1000 shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="font-['Pinyon_Script'] text-3xl font-normal leading-none tracking-normal text-[#2b2b2b]"
            >
              Mehaa
            </Link>

            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <X size={25} strokeWidth={1.8} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-6 pt-6">
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-gray-100 text-[16px] font-medium text-gray-800 hover:text-black transition"
              >
                Home
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                to="/shop"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-gray-100 text-[16px] font-medium text-gray-800 hover:text-black transition"
              >
                Collections
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                to="/contact-us"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-gray-100 text-[16px] font-medium text-gray-800 hover:text-black transition"
              >
                Contact
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </nav>

          {/* Cart */}
          <div className="px-6 mt-6">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/cart");
              }}
              className="w-full flex items-center justify-between py-4 border-y border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={21} strokeWidth={1.8} />
                <span className="text-[16px] font-medium text-gray-800">
                  Shopping Cart
                </span>
              </div>

              {cartCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-black text-white text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* User Section */}
          <div className="px-6 mt-7">
            {isAuthenticated ? (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Account Links */}
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/account");
                    }}
                    className="w-full text-left py-3 text-[15px] text-gray-700 hover:text-black transition"
                  >
                    My Account
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/orders");
                    }}
                    className="w-full text-left py-3 text-[15px] text-gray-700 hover:text-black transition"
                  >
                    My Orders
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-5 mb-8 border border-red-400 text-red-500 py-3 rounded-full text-sm font-medium hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full border border-gray-300 py-3 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/register");
                  }}
                  className="w-full mt-3 bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-900 transition"
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Bottom Brand Text */}
          <div className="mt-auto px-6 py-6">
            <p className="text-[11px] tracking-[3px] uppercase text-gray-400">
              Mehaa Garments
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Elegance in Every Saree
            </p>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-999 md:hidden"
        />
      )}
    </>
  );
};

export default Navbar;
