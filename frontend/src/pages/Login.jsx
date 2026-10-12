import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import AuthLayout from "../components/AuthLayout";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      return Swal.fire({
        icon: "warning",
        title: "Email and password are required",
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

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      // Save authentication information
      login(data);

      await Swal.fire({
        icon: "success",
        title: "Welcome back",
        text: `Welcome, ${data.user?.name || data.name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      // -----------------------------------------
      // ADMIN REDIRECT
      // -----------------------------------------

      if (data.user?.role === "admin") {
        navigate("/admin/products", {
          replace: true,
        });

        return;
      }

      // -----------------------------------------
      // NORMAL USER REDIRECT
      // -----------------------------------------

      const redirectPath = location.state?.from?.pathname || "/";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message || "Unable to login. Please try again.",
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to continue shopping">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="text-sm text-gray-600">Email Address</label>

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
          <label className="text-sm text-gray-600">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
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

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Register */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?
          <Link
            to="/register"
            className="text-black font-medium ml-1 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
