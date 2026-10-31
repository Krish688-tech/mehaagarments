import { Routes, Route } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ShopPage from "./pages/ShopPage";
import MyAccount from "./pages/MyAccount";
import CollectionPage from "./pages/CollectionPage";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProductSpecification from "./pages/ProductSpecification";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import AdminNewsletter from "./pages/AdminNewsletter";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import PaymentPolicy from "./pages/PaymentPolicy";
import TermsConditions from "./pages/TermsConditions";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminEditProduct from "./pages/AdminEditProduct";

import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCategories from "./pages/AdminCategories";
import AdminUniqueCategories from "./pages/AdminUniqueCategories";
import AdminReviews from "./pages/AdminReviews";
import AdminInvoice from "./pages/AdminInvoice";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* =================================================
            CUSTOMER WEBSITE
        ================================================= */}

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collections/:category" element={<CollectionPage />} />
          <Route
            path="/collection/:category/specification/:id"
            element={<ProductSpecification />}
          />
          <Route path="/cart" element={<CartPage />} />
          
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<MyAccount />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Route>
        </Route>

        {/* =================================================
            ADMIN PANEL
        ================================================= */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/add" element={<AdminAddProduct />} />
            <Route
              path="/admin/products/edit/:id"
              element={<AdminEditProduct />}
            />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route
              path="/admin/unique-categories"
              element={<AdminUniqueCategories />}
            />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/newsletter" element={<AdminNewsletter />} />
            <Route path="/admin/invoices/:id" element={<AdminInvoice />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
