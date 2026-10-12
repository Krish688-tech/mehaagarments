import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Trash2,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  ChevronRight,
  Minus,
  Plus,
  Pencil,
  ArrowLeft,
  PackageCheck,
  LockKeyhole,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const CartPage = () => {
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const token = userInfo?.token;

  // ======================================================
  // CART STATE
  // ======================================================

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const [removingProductId, setRemovingProductId] = useState(null);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

  // ======================================================
  // USER DATA
  // ======================================================

  const [userData, setUserData] = useState(null);

  // ======================================================
  // FETCH USER PROFILE
  // ======================================================

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data?.success && data?.user) {
          setUserData(data.user);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUserData(null);
      }
    };

    fetchProfile();
  }, [token]);

  // ======================================================
  // FORMAT BACKEND CART
  // ======================================================

  const formatCartItems = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((item) => item.product)
      .map((item) => ({
        ...item.product,
        quantity: Number(item.quantity || 1),
      }));
  };

  // ======================================================
  // FETCH USER CART
  // ======================================================

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCartItems([]);
        setCartLoading(false);
        setCartError("Please login to view your cart.");
        return;
      }

      try {
        setCartLoading(true);
        setCartError("");

        const { data } = await axios.get(`${API_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const items = data?.cart?.items || [];

        setCartItems(formatCartItems(items));
      } catch (error) {
        console.error("Error fetching cart:", error);

        setCartItems([]);

        setCartError(
          error.response?.data?.message ||
            "Unable to load your cart. Please try again.",
        );
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // ======================================================
  // TOTAL QUANTITY
  // ======================================================

  const totalQuantity = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  // ======================================================
  // TOTAL PRICE
  // ======================================================

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  // ======================================================
  // DISPATCH CART UPDATE
  // ======================================================

  const notifyCartUpdated = () => {
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ======================================================
  // UPDATE QUANTITY
  // ======================================================

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!token || !productId) {
      return;
    }

    const quantity = Number(newQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    const currentItem = cartItems.find((item) => item._id === productId);

    if (!currentItem) {
      return;
    }

    const stock = Number(currentItem.stock || 0);

    if (stock > 0 && quantity > stock) {
      setCartError(`Only ${stock} item(s) available in stock.`);
      return;
    }

    try {
      setUpdatingProductId(productId);
      setCartError("");

      const { data } = await axios.put(
        `${API_URL}/cart/${productId}`,
        {
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedItems = data?.cart?.items || [];

      setCartItems(formatCartItems(updatedItems));

      notifyCartUpdated();
    } catch (error) {
      console.error("Update cart quantity error:", error);

      setCartError(
        error.response?.data?.message || "Unable to update product quantity.",
      );
    } finally {
      setUpdatingProductId(null);
    }
  };

  // ======================================================
  // REMOVE ITEM
  // ======================================================

  const handleRemove = async (productId) => {
    if (!token || !productId) {
      return;
    }

    try {
      setRemovingProductId(productId);
      setCartError("");

      const { data } = await axios.delete(`${API_URL}/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedItems = data?.cart?.items || [];

      setCartItems(formatCartItems(updatedItems));

      notifyCartUpdated();
    } catch (error) {
      console.error("Remove cart item error:", error);

      setCartError(
        error.response?.data?.message ||
          "Unable to remove this product from your cart.",
      );
    } finally {
      setRemovingProductId(null);
    }
  };

  // ======================================================
  // CLEAR CART
  // ======================================================

  const handleClearCart = async () => {
    if (!token || !cartItems.length) {
      return;
    }

    try {
      setClearingCart(true);
      setCartError("");

      await axios.delete(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems([]);

      notifyCartUpdated();
    } catch (error) {
      console.error("Clear cart error:", error);

      setCartError(
        error.response?.data?.message || "Unable to clear your cart.",
      );
    } finally {
      setClearingCart(false);
    }
  };

  // ======================================================
  // BUY NOW
  // ======================================================

  const handleBuyNow = (item) => {
    localStorage.setItem("buyNowProduct", JSON.stringify(item));

    localStorage.removeItem("checkoutCart");

    navigate("/checkout");
  };

  // ======================================================
  // PROCEED TO CHECKOUT
  // ======================================================

  const handleProceedToCheckout = () => {
    if (!cartItems.length) {
      return;
    }

    localStorage.removeItem("buyNowProduct");

    localStorage.setItem("checkoutCart", JSON.stringify(cartItems));

    navigate("/checkout");
  };

  // ======================================================
  // LOGIN REQUIRED
  // ======================================================

  if (!token && !cartLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-4xl p-14 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-black text-white flex items-center justify-center">
              <ShoppingBag size={34} />
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold mt-7 text-[#111]">
              Login to view your cart
            </h2>

            <p className="text-gray-500 mt-4 max-w-md mx-auto">
              Your saved cart is available whenever you log in to your Mehaa
              account.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-8 bg-black text-white px-9 py-4 rounded-full hover:bg-gray-800 transition duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-black text-white flex items-center justify-center animate-pulse">
            <ShoppingBag size={28} />
          </div>

          <p className="text-gray-500 mt-5">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // EMPTY CART
  // ======================================================

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-[#fafafa] pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <span>Home</span>
            <ChevronRight size={15} />
            <span className="text-black">Cart</span>
          </div>

          <div className="bg-white rounded-4xl p-14 md:p-20 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-black text-white flex items-center justify-center">
              <ShoppingBag size={34} />
            </div>

            <h1 className="text-4xl font-semibold text-[#111] mt-8">
              Your cart is empty
            </h1>

            <p className="text-gray-500 mt-4 max-w-md mx-auto">
              Discover beautiful sarees from Mehaa Garments and add your
              favourites to your cart.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-9 bg-black text-white px-9 py-4 rounded-full hover:bg-gray-800 transition duration-300 inline-flex items-center gap-3"
            >
              Continue Shopping
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN CART PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#fafafa] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* ================================================== */}
        {/* BREADCRUMB */}
        {/* ================================================== */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <button
            onClick={() => navigate("/")}
            className="hover:text-black transition"
          >
            Home
          </button>

          <ChevronRight size={15} />

          <span className="text-black">Cart</span>
        </div>

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#111]">
              Shopping Cart
            </h1>

            <p className="text-gray-500 mt-3 text-lg">
              Review your selected sarees before checkout
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Truck size={22} className="text-black" />

              <div>
                <p className="font-semibold text-sm">Free Shipping</p>

                <p className="text-xs text-gray-500">Across India</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3">
              <ShieldCheck size={22} className="text-black" />

              <div>
                <p className="font-semibold text-sm">100% Secure</p>

                <p className="text-xs text-gray-500">Payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {cartError && (
          <div className="mb-8 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4">
            {cartError}
          </div>
        )}

        {/* ================================================== */}
        {/* MAIN GRID */}
        {/* ================================================== */}

        <div className="grid xl:grid-cols-[minmax(0,1fr)_390px] gap-8 items-start">
          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <div className="space-y-8">
            {/* ================================================== */}
            {/* DELIVERY DETAILS */}
            {/* ================================================== */}

            <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-[#111]">
                      Delivery Details
                    </h2>

                    <p className="text-gray-500 mt-1 text-sm">
                      Auto-fetched from your account
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                >
                  <Pencil size={16} />
                  Edit Address
                </button>
              </div>

              {/* DETAILS */}

              <div className="mt-7 grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-[#fafafa] border border-gray-100 p-5">
                  <div className="flex items-center gap-3 text-gray-500">
                    <ShoppingBag size={17} />

                    <span className="text-xs uppercase tracking-wider">
                      Full Name
                    </span>
                  </div>

                  <p className="mt-3 font-medium text-[#111]">
                    {userData?.name ||
                      `${userData?.address?.firstName || ""} ${userData?.address?.lastName || ""}`.trim() ||
                      "Not Available"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fafafa] border border-gray-100 p-5">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Mail size={17} />

                    <span className="text-xs uppercase tracking-wider">
                      Email Address
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[#111] break-all">
                      {userData?.email || "Not Available"}
                    </p>

                    {userData?.email && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#fafafa] border border-gray-100 p-5">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Phone size={17} />

                    <span className="text-xs uppercase tracking-wider">
                      Phone Number
                    </span>
                  </div>

                  <p className="mt-3 font-medium text-[#111]">
                    {userData?.address?.phone ||
                      userData?.phone ||
                      "Not Available"}
                  </p>
                </div>
              </div>

              {/* ADDRESS */}

              <div className="mt-4 rounded-2xl bg-[#fafafa] border border-gray-100 p-5">
                <div className="flex items-center gap-3 text-gray-500">
                  <MapPin size={17} />

                  <span className="text-xs uppercase tracking-wider">
                    Delivery Address
                  </span>
                </div>

                <p className="mt-3 text-[#222] leading-relaxed">
                  {userData?.address?.firstName} {userData?.address?.lastName}
                  <br />
                  {userData?.address?.address}
                  <br />
                  {userData?.address?.city && `${userData.address.city}, `}
                  {userData?.address?.state}
                  <br />
                  {userData?.address?.pincode}
                  <br />
                  {userData?.address?.country}
                </p>
              </div>
            </div>

            {/* ================================================== */}
            {/* CART ITEMS */}
            {/* ================================================== */}

            <div className="bg-white rounded-[30px] p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <ShoppingBag size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold">
                      Cart Items ({totalQuantity})
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {totalQuantity} item
                      {totalQuantity !== 1 ? "s" : ""} in your cart
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClearCart}
                  disabled={clearingCart}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  <Trash2 size={16} />

                  {clearingCart ? "Clearing..." : "Clear Cart"}
                </button>
              </div>

              {/* ================================================== */}
              {/* ITEMS */}
              {/* ================================================== */}

              <div className="mt-7 space-y-4">
                {cartItems.map((item) => {
                  const discountPercentage =
                    Number(item.oldPrice || 0) > Number(item.price || 0)
                      ? Math.round(
                          ((Number(item.oldPrice) - Number(item.price)) /
                            Number(item.oldPrice)) *
                            100,
                        )
                      : 0;

                  const isUpdating = updatingProductId === item._id;

                  const isRemoving = removingProductId === item._id;

                  const stock = Number(item.stock || 0);

                  return (
                    <div
                      key={item._id}
                      className="group border border-gray-200 rounded-[26px] p-4 md:p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="grid lg:grid-cols-[120px_minmax(0,1fr)_150px_120px_50px] gap-5 items-center">
                        {/* IMAGE */}

                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-36 md:h-40 lg:h-32 object-cover rounded-2xl bg-gray-100"
                          />

                          {discountPercentage > 0 && (
                            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        {/* PRODUCT DETAILS */}

                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-[#111] leading-snug">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            With love from Mehaa Garments
                          </p>

                          <div className="mt-3 flex items-center flex-wrap gap-3">
                            <span className="text-xl font-bold text-[#111]">
                              ₹{Number(item.price || 0).toLocaleString("en-IN")}
                            </span>

                            {item.oldPrice > item.price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
                            {stock > 0 ? (
                              <span className="text-green-600 font-medium">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Out of Stock
                              </span>
                            )}

                            {item.category && (
                              <>
                                <span className="text-gray-300">•</span>

                                <span className="text-gray-500">
                                  {item.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* QUANTITY */}

                        <div>
                          <p className="text-xs text-gray-500 mb-2">Quantity</p>

                          <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={
                                item.quantity <= 1 || isUpdating || isRemoving
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>

                            <div className="w-11 h-10 flex items-center justify-center border-x border-gray-200 font-semibold">
                              {isUpdating ? (
                                <span className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </div>

                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                isUpdating ||
                                isRemoving ||
                                (stock > 0 && item.quantity >= stock)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {stock > 0 && (
                            <p className="text-[11px] text-gray-400 mt-2">
                              Max {stock} available
                            </p>
                          )}
                        </div>

                        {/* TOTAL */}

                        <div className="lg:text-right">
                          <p className="text-xs text-gray-500">Total</p>

                          <p className="text-xl font-bold text-[#111] mt-1">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            ).toLocaleString("en-IN")}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}{" "}
                            each
                          </p>
                        </div>

                        {/* REMOVE */}

                        <button
                          onClick={() => handleRemove(item._id)}
                          disabled={isRemoving || isUpdating}
                          title="Remove item"
                          className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 flex items-center justify-center transition disabled:opacity-40"
                        >
                          {isRemoving ? (
                            <span className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================================================== */}
            {/* CONTINUE SHOPPING */}
            {/* ================================================== */}

            <button
              onClick={() => navigate("/")}
              className="w-full bg-white border border-gray-200 rounded-[26px] p-5 flex items-center justify-between hover:border-gray-400 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowLeft size={19} />
                </div>

                <div className="text-left">
                  <p className="font-semibold text-[#111]">Continue Shopping</p>

                  <p className="text-sm text-gray-500 mt-1">
                    Explore more beautiful sarees
                  </p>
                </div>
              </div>

              <ChevronRight size={20} />
            </button>
          </div>

          {/* ================================================== */}
          {/* RIGHT — ORDER SUMMARY */}
          {/* ================================================== */}

          <div className="xl:sticky xl:top-28">
            <div className="bg-[#3c3c3c] text-white rounded-[30px] p-7 md:p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Order Summary</h2>

                  <p className="text-gray-400 text-sm mt-2">
                    {totalQuantity} item
                    {totalQuantity !== 1 ? "s" : ""} in your cart
                  </p>
                </div>

                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                  <PackageCheck size={21} />
                </div>
              </div>

              <div className="border-t border-white/15 mt-7 pt-7 space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subtotal</span>

                  <span className="font-semibold">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shipping</span>

                  <span className="text-green-400 font-semibold">Free</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fee</span>

                  <span className="font-semibold">₹0</span>
                </div>
              </div>

              <div className="border-t border-white/15 mt-7 pt-7 flex items-center justify-between">
                <span className="text-xl font-semibold">Total</span>

                <span className="text-3xl font-bold">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* CHECKOUT */}

              <button
                onClick={handleProceedToCheckout}
                className="w-full mt-8 py-4 rounded-2xl bg-white text-black font-semibold text-base hover:bg-gray-200 transition duration-300 flex items-center justify-center gap-3"
              >
                Proceed To Checkout
                <ChevronRight size={19} />
              </button>

              {/* TRUST */}

              <div className="mt-7 space-y-1">
                <div className="flex items-center gap-4 py-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <LockKeyhole size={18} />
                  </div>

                  <div>
                    <p className="font-medium text-sm">100% Secure Payments</p>

                    <p className="text-xs text-gray-400 mt-1">
                      Your payments are protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Truck size={18} />
                  </div>

                  <div>
                    <p className="font-medium text-sm">
                      Free Shipping Across India
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      No extra charges on delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="font-medium text-sm">
                      Premium Quality Guarantee
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Only the best sarees for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
