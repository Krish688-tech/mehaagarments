import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  CreditCard,
  LockKeyhole,
  MapPin,
  UserRound,
  Mail,
  Phone,
  ChevronLeft,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CheckoutPage = () => {
  const navigate = useNavigate();

  // =========================================================
  // USER
  // =========================================================

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;

  // =========================================================
  // CHECKOUT PRODUCT
  // Supports:
  // 1. Buy Now
  // 2. Cart → Proceed to Checkout
  // =========================================================
  const buyNowProduct =
    JSON.parse(localStorage.getItem("buyNowProduct")) || null;

  const checkoutCart = JSON.parse(localStorage.getItem("checkoutCart")) || null;

  const checkoutItems =
    Array.isArray(checkoutCart) && checkoutCart.length > 0
      ? checkoutCart
      : buyNowProduct
        ? [buyNowProduct]
        : [];

  const isCartCheckout = Array.isArray(checkoutCart) && checkoutCart.length > 0;

  // =========================================================
  // STATES
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [saveInfo, setSaveInfo] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // =========================================================
  // TOTALS
  // =========================================================

  const totalQuantity = useMemo(() => {
    return checkoutItems.reduce(
      (total, item) => total + Math.max(Number(item.quantity) || 1, 1),
      0,
    );
  }, [checkoutItems]);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((total, item) => {
      const quantity = Math.max(Number(item.quantity) || 1, 1);
      const price = Number(item.price) || 0;

      return total + price * quantity;
    }, 0);
  }, [checkoutItems]);

  const shipping = 0;

  const total = subtotal + shipping;

  // =========================================================
  // AUTH PROTECTION
  // =========================================================

  useEffect(() => {
    if (!userInfo?.token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, userInfo?.token]);

  // =========================================================
  // LOAD RAZORPAY
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const existingScript = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(true));
          existingScript.addEventListener("error", () => resolve(false));
          return;
        }

        const script = document.createElement("script");

        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => resolve(true);

        script.onerror = () => resolve(false);

        document.body.appendChild(script);
      });
    };

    loadRazorpay().then((loaded) => {
      if (mounted) {
        setRazorpayReady(loaded);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FETCH CUSTOMER PROFILE
  // =========================================================

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.token) return;

      try {
        const { data } = await axios.get(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        setFormData((prev) => ({
          ...prev,

          firstName:
            data?.address?.firstName || data?.name?.split(" ")[0] || "",

          lastName:
            data?.address?.lastName ||
            data?.name?.split(" ").slice(1).join(" ") ||
            "",

          email: data?.email || "",

          phone: data?.address?.phone || "",

          address: data?.address?.address || "",

          apartment: data?.address?.apartment || "",

          city: data?.address?.city || "",

          state: data?.address?.state || "",

          pincode: data?.address?.pincode || "",

          country: data?.address?.country || "India",
        }));
      } catch (error) {
        console.error("FETCH PROFILE ERROR:", error);
      }
    };

    fetchProfile();
  }, [userInfo?.token]);

  // =========================================================
  // NO PRODUCT
  // =========================================================
  const hasProduct =
    checkoutItems.length > 0 &&
    checkoutItems.every(
      (item) =>
        item?._id && item?.image && item?.name && Number(item?.price) > 0,
    );

  if (!hasProduct) {
    return (
      <div className="min-h-screen bg-white px-6 pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <CreditCard size={30} strokeWidth={1.5} />
          </div>

          <h2 className="font-serif text-4xl text-black">No Product Found</h2>

          <p className="mt-4 text-sm leading-6 text-gray-500">
            Your checkout session is empty. Please select a product before
            continuing.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateFields = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredFields) {
      if (!String(formData[field] || "").trim()) {
        Swal.fire({
          icon: "warning",
          title: "Complete your details",
          text: "Please fill all required delivery fields.",
          confirmButtonColor: "#000000",
        });

        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#000000",
      });

      return false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Invalid phone number",
        text: "Please enter a valid phone number.",
        confirmButtonColor: "#000000",
      });

      return false;
    }

    const pincodeDigits = formData.pincode.replace(/\D/g, "");

    if (pincodeDigits.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid PIN code",
        text: "Please enter a valid 6-digit PIN code.",
        confirmButtonColor: "#000000",
      });

      return false;
    }

    return true;
  };

  // =========================================================
  // SAVE ADDRESS
  // =========================================================

  const saveCustomerAddress = async () => {
    if (!saveInfo) return;

    await axios.put(`${API_URL}/users/save-address`, formData, {
      headers: {
        Authorization: `Bearer ${userInfo?.token}`,
      },
    });
  };

  // =========================================================
  // CREATE ORDER
  // =========================================================

  const createBackendOrder = async () => {
    const { data } = await axios.post(
      `${API_URL}/orders/create`,
      {
        orderItems: checkoutItems.map((item) => ({
          productId: item._id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: Math.max(Number(item.quantity) || 1, 1),
        })),
        paymentMethod,
        shippingAddress: formData,
      },
      {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
      },
    );

    return data;
  };

  // =========================================================
  // COMPLETE COD ORDER
  // =========================================================

  const completeCodOrder = () => {
    localStorage.removeItem("buyNowProduct");
    localStorage.removeItem("checkoutCart");

    window.dispatchEvent(new Event("cartUpdated"));

    Swal.fire({
      icon: "success",
      title: "Order Placed",
      text: "Your Cash on Delivery order has been placed successfully.",
      confirmButtonColor: "#000000",
    }).then(() => {
      navigate("/order-success", {
        replace: true,
      });
    });
  };

  // =========================================================
  // RAZORPAY PAYMENT
  // =========================================================

  const openRazorpay = (data) => {
    if (!window.Razorpay) {
      throw new Error("Razorpay payment gateway is unavailable.");
    }

    if (!data?.razorpayOrder?.id) {
      throw new Error("Razorpay order was not created correctly.");
    }

    const options = {
      key: data.key,

      amount: data.razorpayOrder.amount,

      currency: data.razorpayOrder.currency || "INR",

      name: "Mehaa Garments",

      description:
        checkoutItems.length === 1
          ? `Purchase - ${checkoutItems[0].name}`
          : `Mehaa Garments Order - ${checkoutItems.length} items`,

      order_id: data.razorpayOrder.id,

      image: checkoutItems[0]?.image || undefined,

      prefill: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),

        email: formData.email,

        contact: formData.phone,
      },

      notes: {
        product_id: checkoutItems[0]?._id || "",
      },

      theme: {
        color: "#000000",
      },

      modal: {
        escape: true,

        backdropclose: false,

        ondismiss: () => {
          setLoading(false);

          Swal.fire({
            icon: "info",
            title: "Payment Cancelled",
            text: "The payment window was closed. Your order has not been marked as paid.",
            confirmButtonColor: "#000000",
          });
        },
      },

      handler: async (response) => {
        try {
          setLoading(true);

          // =========================================
          // VERIFY PAYMENT ON BACKEND
          // =========================================

          await axios.put(
            `${API_URL}/orders/${data.order._id}/pay`,
            {
              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_order_id: response.razorpay_order_id,

              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${userInfo?.token}`,
              },
            },
          );

          // =========================================
          // PAYMENT SUCCESS
          // =========================================

          localStorage.removeItem("buyNowProduct");
          localStorage.removeItem("checkoutCart");

          window.dispatchEvent(new Event("cartUpdated"));

          await Swal.fire({
            icon: "success",
            title: "Payment Successful",
            text: "Your order has been placed successfully.",
            confirmButtonColor: "#000000",
          });

          navigate("/order-success", {
            replace: true,
          });
        } catch (error) {
          console.error("PAYMENT VERIFICATION ERROR:", error);

          setLoading(false);

          Swal.fire({
            icon: "error",
            title: "Payment Verification Failed",
            text:
              error?.response?.data?.message ||
              "We could not verify your payment. Please contact support if money was deducted.",
            confirmButtonColor: "#000000",
          });
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response) => {
      console.error("RAZORPAY PAYMENT FAILED:", response);

      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          response?.error?.description ||
          "Your payment could not be completed.",
        confirmButtonColor: "#000000",
      });
    });

    razorpay.open();
  };

  // =========================================================
  // MAIN CHECKOUT HANDLER
  // =========================================================

  const handlePayNow = async () => {
    if (loading) return;

    if (!validateFields()) {
      return;
    }

    // Razorpay is required only for Razorpay payment.
    if (paymentMethod === "razorpay" && !razorpayReady) {
      Swal.fire({
        icon: "error",
        title: "Payment Gateway Unavailable",
        text: "Razorpay is still loading. Please wait a moment and try again.",
        confirmButtonColor: "#000000",
      });

      return;
    }

    if (!userInfo?.token) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login before placing your order.",
        confirmButtonColor: "#000000",
      });

      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // =========================================
      // SAVE CUSTOMER ADDRESS
      // =========================================

      await saveCustomerAddress();

      // =========================================
      // CREATE DATABASE ORDER
      // =========================================

      const data = await createBackendOrder();

      // =========================================
      // COD
      // =========================================

      if (paymentMethod === "cod") {
        setLoading(false);

        completeCodOrder();

        return;
      }

      // =========================================
      // RAZORPAY
      // =========================================

      openRazorpay(data);

      // IMPORTANT:
      // Do NOT set loading(false) here.
      // Razorpay is still open.
      //
      // Loading is cleared by:
      // 1. payment success
      // 2. payment failure
      // 3. payment cancellation
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Checkout Failed",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while creating your order.",
        confirmButtonColor: "#000000",
      });
    }
  };

  // =========================================================
  // INPUT CLASS
  // =========================================================

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

  // =========================================================
  // RETURN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 lg:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <div className="mb-10 border-b border-gray-100 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
          >
            <ChevronLeft size={17} />
            Back
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-gray-400">
                Mehaa Garments
              </p>

              <h1 className="font-serif text-4xl leading-none text-black sm:text-5xl">
                Checkout
              </h1>

              <p className="mt-3 text-sm text-gray-500">
                Complete your purchase securely.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <LockKeyhole size={15} />
              Secure checkout
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <div className="space-y-8">
            {/* =================================================
                CONTACT
            ================================================== */}

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Mail size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Contact information
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    We will use this for order updates.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  autoComplete="email"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </section>

            {/* =================================================
                DELIVERY
            ================================================== */}

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <MapPin size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Delivery address
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {/* NAME */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <div>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* ADDRESS */}

              <div className="mt-4">
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  autoComplete="street-address"
                  className={inputClass}
                />
              </div>

              {/* APARTMENT */}

              <div className="mt-4">
                <input
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, landmark (optional)"
                  autoComplete="address-line2"
                  className={inputClass}
                />
              </div>

              {/* CITY / STATE / PIN */}

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  autoComplete="address-level2"
                  className={inputClass}
                />

                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  autoComplete="address-level1"
                  className={inputClass}
                />

                <input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="PIN code"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  className={inputClass}
                />
              </div>

              {/* PHONE */}

              <div className="relative mt-4">
                <Phone
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  inputMode="tel"
                  autoComplete="tel"
                  className={`${inputClass} pl-11`}
                />
              </div>

              {/* COUNTRY */}

              <div className="mt-4">
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className={inputClass}
                />
              </div>

              {/* SAVE INFO */}

              <label className="mt-5 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-black"
                />

                <span className="text-sm text-gray-600">
                  Save this information for my next purchase.
                </span>
              </label>
            </section>

            {/* =================================================
                PAYMENT
            ================================================== */}

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <CreditCard size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Payment method
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                {/* RAZORPAY */}

                <label
                  className={`flex cursor-pointer items-center justify-between gap-4 p-5 transition ${
                    paymentMethod === "razorpay"
                      ? "bg-gray-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="h-4 w-4 accent-black"
                    />

                    <div>
                      <p className="text-sm font-semibold text-black">
                        Razorpay
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        UPI, Cards, Net Banking & Wallets
                      </p>
                    </div>
                  </div>

                  <CreditCard size={21} className="text-gray-700" />
                </label>

                {/* COD */}

                <label
                  className={`flex cursor-pointer items-center justify-between gap-4 border-t border-gray-200 p-5 transition ${
                    paymentMethod === "cod"
                      ? "bg-gray-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 accent-black"
                    />

                    <div>
                      <p className="text-sm font-semibold text-black">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Pay when your order arrives.
                      </p>
                    </div>
                  </div>

                  <Truck size={21} className="text-gray-700" />
                </label>
              </div>

              {/* RAZORPAY STATUS */}

              {paymentMethod === "razorpay" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                  <ShieldCheck size={16} className="text-gray-700" />

                  {razorpayReady
                    ? "Secure Razorpay checkout is ready."
                    : "Preparing secure payment gateway..."}
                </div>
              )}
            </section>

            {/* =================================================
                TRUST FEATURES
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 p-5">
                <ShieldCheck size={21} className="mb-3" />

                <p className="text-sm font-semibold">Secure Payment</p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Payment details are processed securely.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <Truck size={21} className="mb-3" />

                <p className="text-sm font-semibold">Free Shipping</p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Safe delivery to your address.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5">
                <BadgeCheck size={21} className="mb-3" />

                <p className="text-sm font-semibold">Authentic Products</p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Genuine Mehaa Garments products.
                </p>
              </div>
            </div>

            {/* =================================================
                PAY BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handlePayNow}
              disabled={
                loading || (paymentMethod === "razorpay" && !razorpayReady)
              }
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-black py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  {paymentMethod === "cod"
                    ? "PLACING ORDER..."
                    : "PROCESSING PAYMENT..."}
                </>
              ) : paymentMethod === "cod" ? (
                `PLACE ORDER • ₹${total.toLocaleString("en-IN")}`
              ) : (
                `PAY ₹${total.toLocaleString("en-IN")}`
              )}
            </button>

            <p className="text-center text-xs leading-5 text-gray-400">
              By placing your order, you agree to Mehaa Garments{" "}
              <Link
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800"
              >
                Terms and Conditions
              </Link>{" "}
              and purchase conditions.
            </p>
          </div>

          {/* ===================================================
              RIGHT ORDER SUMMARY
          ==================================================== */}

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              {/* SUMMARY HEADER */}

              <div className="border-b border-gray-200 px-6 py-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400">
                  Your order
                </p>

                <h2 className="mt-2 font-serif text-2xl text-black">
                  Order Summary
                </h2>
              </div>

              {/* PRODUCT */}

              <div className="p-6">
                <div className="space-y-5">
                  {checkoutItems.map((item) => {
                    const itemQuantity = Math.max(
                      Number(item.quantity) || 1,
                      1,
                    );

                    const itemTotal = Number(item.price || 0) * itemQuantity;

                    return (
                      <div key={item._id} className="flex gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={item.image}
                            alt={item.name || "Mehaa Garments product"}
                            className="h-28 w-24 rounded-xl object-cover"
                          />

                          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-semibold text-white">
                            {itemQuantity}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                            Mehaa Garments
                          </p>

                          <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-black">
                            {item.name}
                          </h3>

                          <p className="mt-2 text-xs text-gray-500">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")} ×{" "}
                            {itemQuantity}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-sm font-semibold text-black">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* DIVIDER */}

                <div className="my-7 border-t border-gray-200" />

                {/* TOTALS */}

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Subtotal ({totalQuantity} items)</span>

                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Shipping</span>

                    <span className="font-medium text-gray-900">Free</span>
                  </div>
                </div>

                <div className="my-6 border-t border-gray-300" />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Including shipping
                    </p>
                  </div>

                  <p className="text-3xl font-semibold text-black">
                    ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* SECURITY */}

              <div className="border-t border-gray-200 bg-white px-6 py-5">
                <div className="flex items-start gap-3">
                  <LockKeyhole size={18} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold text-black">
                      Secure checkout
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Your payment is processed securely through our payment
                      gateway.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE CONTINUE SHOPPING */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
