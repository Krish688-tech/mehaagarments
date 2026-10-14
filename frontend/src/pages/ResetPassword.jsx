import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, EyeOff, LockKeyhole, ArrowLeft } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please enter and confirm your new password.",
        confirmButtonColor: "#000000",
      });
    }

    if (password.length < 8) {
      return Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Your password must contain at least 8 characters.",
        confirmButtonColor: "#000000",
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure both passwords are identical.",
        confirmButtonColor: "#000000",
      });
    }

    if (!token) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Reset Link",
        text: "This password reset link is invalid. Please request a new one.",
        confirmButtonColor: "#000000",
      });
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/auth/reset-password/${encodeURIComponent(token)}`,
        { password },
      );

      await Swal.fire({
        icon: "success",
        title: "Password Reset Successful!",
        text: "Your password has been changed. You can now log in with your new password.",
        confirmButtonColor: "#000000",
        confirmButtonText: "Go to Login",
        allowOutsideClick: false,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to reset your password. Please request a new reset link and try again.";

      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: message,
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Choose a strong password to secure your Mehaa Garments account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label htmlFor="password" className="text-sm text-gray-600">
            New Password
          </label>

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            disabled={loading}
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-black transition disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-10 text-gray-500 hover:text-black transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <label htmlFor="confirmPassword" className="text-sm text-gray-600">
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            disabled={loading}
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-black transition disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-10 text-gray-500 hover:text-black transition"
            aria-label={
              showConfirmPassword ? "Hide password" : "Show password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Use at least 8 characters. Choose a password you don't use on other
          websites.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <LockKeyhole size={18} />
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>

        <p className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
