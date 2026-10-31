
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

import axios from "axios";
import Swal from "sweetalert2";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // ==========================================
  // NEWSLETTER STATES
  // ==========================================

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // ==========================================
  // NEWSLETTER SUBSCRIPTION
  // ==========================================

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();

    const email = newsletterEmail.trim().toLowerCase();

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address.",
        confirmButtonColor: "#007d76",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#007d76",
      });
    }

    if (!newsletterConsent) {
      return Swal.fire({
        icon: "info",
        title: "One Last Step!",
        text: "Please agree to receive our newsletter and promotional emails.",
        confirmButtonColor: "#007d76",
      });
    }

    try {
      setNewsletterLoading(true);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/newsletter/subscribe`,
        {
          email,
          consent: true,
        }
      );

      if (data.success) {
        setNewsletterEmail("");
        setNewsletterConsent(false);

        Swal.fire({
          icon: "success",
          title: "Welcome to Mehaa!",
          text: data.message,
          confirmButtonColor: "#007d76",
          confirmButtonText: "Continue Shopping",
        });
      }
    } catch (error) {
      console.error("NEWSLETTER SUBSCRIPTION ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Subscription Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again later.",
        confirmButtonColor: "#007d76",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-[#111111] text-white">
      {/* Newsletter / Brand Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/45 mb-5">
                Mehaa Garments
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight font-normal">
                Timeless sarees,
                <br />
                <span className="text-white/55">beautifully yours.</span>
              </h2>

              <p className="text-sm text-white/50 leading-7 max-w-lg mt-6">
                Discover elegant sarees crafted to celebrate everyday moments,
                festive occasions and the timeless beauty of Indian tradition.
              </p>
            </div>

            {/* NEWSLETTER SUBSCRIPTION */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                Stay connected
              </p>

              <form onSubmit={handleNewsletterSubscribe}>
                {/* EMAIL INPUT */}
                <div className="flex items-center border-b border-white/20 pb-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={newsletterLoading}
                    required
                    maxLength={254}
                    autoComplete="email"
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-white/30 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={newsletterLoading}
                    className="text-xs uppercase tracking-[0.15em] text-white hover:text-white/60 transition flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newsletterLoading ? "Joining..." : "Subscribe"}

                    {newsletterLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <ArrowUpRight size={15} />
                    )}
                  </button>
                </div>

                {/* MARKETING CONSENT */}
                <label className="flex items-start gap-2 mt-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newsletterConsent}
                    onChange={(e) =>
                      setNewsletterConsent(e.target.checked)
                    }
                    disabled={newsletterLoading}
                    className="mt-0.5 accent-[#007d76] cursor-pointer shrink-0"
                  />

                  <span className="text-[10px] leading-relaxed text-white/40 group-hover:text-white/60 transition">
                    I agree to receive email updates about new collections,
                    special offers and promotions from Mehaa Garments.
                  </span>
                </label>

                <p className="text-[11px] text-white/30 mt-3">
                  Receive updates about new collections and special offers.
                  You can unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] gap-x-8 gap-y-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link
              to="/"
              className="inline-block font-serif text-3xl tracking-tight"
            >
              Mehaa Garments
            </Link>

            <p className="text-xs uppercase tracking-[0.25em] text-white/35 mt-3">
              Elegant Sarees for Every Occasion
            </p>

            <p className="text-sm text-white/45 leading-7 max-w-xs mt-6">
              A curated destination for graceful Indian sarees, bringing
              traditional craftsmanship and contemporary elegance together.
            </p>

            <div className="flex items-center gap-3 mt-7">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                <FaInstagram size={16} />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                <FaFacebookF size={16} />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-6">
              Shop
            </h3>

            <div className="flex flex-col gap-4">
              <Link to="/" className="text-sm text-white/65 hover:text-white transition">
                Home
              </Link>

              <Link to="/shop" className="text-sm text-white/65 hover:text-white transition">
                Categories
              </Link>

              <Link to="/shop" className="text-sm text-white/65 hover:text-white transition">
                Collections
              </Link>

              <Link to="/about-us" className="text-sm text-white/65 hover:text-white transition">
                About Us
              </Link>

              <Link to="/contact-us" className="text-sm text-white/65 hover:text-white transition">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-6">
              Information
            </h3>

            <div className="flex flex-col gap-4">
              <Link to="/privacy-policy" className="text-sm text-white/65 hover:text-white transition">
                Privacy Policy
              </Link>

              <Link to="/shipping-policy" className="text-sm text-white/65 hover:text-white transition">
                Shipping Policy
              </Link>

              <Link to="/refund-policy" className="text-sm text-white/65 hover:text-white transition">
                Refund & Cancellation
              </Link>

              <Link to="/payment-policy" className="text-sm text-white/65 hover:text-white transition">
                Payment Policy
              </Link>

              <Link to="/terms-and-conditions" className="text-sm text-white/65 hover:text-white transition">
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-6">
              Contact
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin size={17} className="text-white/40 mt-0.5 shrink-0" />

                <p className="text-sm text-white/55 leading-6">
                  Mehaa Garments
                  <br />
                  Tamil Nadu, India
                </p>
              </div>

              <a
                href="tel:+917418541436"
                className="flex items-center gap-3 text-sm text-white/55 hover:text-white transition"
              >
                <Phone size={16} className="text-white/40" />
                +91 74185 41436
              </a>

              <a
                href="mailto:support@mehaagarments.com"
                className="flex items-center gap-3 text-sm text-white/55 hover:text-white transition break-all"
              >
                <Mail size={16} className="text-white/40 shrink-0" />
                support@mehaagarments.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/35 text-center md:text-left">
              © {currentYear} Mehaa Garments. All rights reserved.
            </p>

            <div className="flex items-center gap-5 text-[11px] text-white/35">
              <span>Made in India</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
