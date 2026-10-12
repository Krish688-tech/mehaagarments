import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "All fields are required",
        confirmButtonColor: "#000000",
      });
    }

    if (name.length < 2) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Name",
        text: "Please enter your full name.",
        confirmButtonColor: "#000000",
      });
    }

    if (!validateEmail(email)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Email Address",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#000000",
      });
    }

    if (password.length < 8) {
      return Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "Password must contain at least 8 characters.",
        confirmButtonColor: "#000000",
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure both passwords are the same.",
        confirmButtonColor: "#000000",
      });
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      login(data);

      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: `Welcome to Mehaa Garments, ${data.user?.name || data.name}`,
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "Unable to create your account. Please try again.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the elegance of Mehaa Garments"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label className="text-sm text-gray-600">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black transition"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label className="text-sm text-gray-600">
            Password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-black transition"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-10.5 text-gray-500 hover:text-black transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="text-sm text-gray-600">
            Confirm Password
          </label>

          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:border-black transition"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((prev) => !prev)
            }
            className="absolute right-4 top-10.5 text-gray-500 hover:text-black transition"
            aria-label={
              showConfirmPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Login */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?

          <Link
            to="/login"
            className="text-black font-medium ml-1 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;