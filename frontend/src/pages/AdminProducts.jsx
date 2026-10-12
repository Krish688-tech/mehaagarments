import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // -----------------------------------------
  // FILTERS
  // -----------------------------------------

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [uniqueCategory, setUniqueCategory] = useState("");
  const [status, setStatus] = useState("");

  // -----------------------------------------
  // PAGINATION
  // -----------------------------------------

  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // -----------------------------------------
  // FETCH CATEGORIES
  // -----------------------------------------

  const fetchCategories = useCallback(async () => {
    try {
      const [categoryResponse, uniqueResponse] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/unique-categories`),
      ]);

      setCategories(
        Array.isArray(categoryResponse.data?.categories)
          ? categoryResponse.data.categories
          : [],
      );

      setUniqueCategories(
        Array.isArray(uniqueResponse.data?.categories)
          ? uniqueResponse.data.categories
          : Array.isArray(uniqueResponse.data?.uniqueCategories)
            ? uniqueResponse.data.uniqueCategories
            : [],
      );
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
      setUniqueCategories([]);
    }
  }, []);

  // -----------------------------------------
  // FETCH ADMIN PRODUCTS
  // -----------------------------------------

  const fetchProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", "20");

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (category) {
          params.append("category", category);
        }

        if (uniqueCategory) {
          params.append("uniqueCategory", uniqueCategory);
        }

        if (status) {
          params.append("status", status);
        }

        const { data } = await axios.get(
          `${API_URL}/products/admin/all?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setProducts(data.products || []);

        setPagination(
          data.pagination || {
            totalProducts: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 20,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        );
      } catch (error) {
        console.error("Failed to fetch admin products:", error);

        setError(error.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    },
    [token, search, category, uniqueCategory, status],
  );

  // -----------------------------------------
  // INITIAL LOAD
  // -----------------------------------------

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchCategories();
    fetchProducts(1);
  }, [token, fetchCategories, fetchProducts]);

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    fetchProducts(1);
  };

  // -----------------------------------------
  // CATEGORY
  // -----------------------------------------

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUniqueCategoryChange = (e) => {
    setUniqueCategory(e.target.value);
  };

  // -----------------------------------------
  // STATUS
  // -----------------------------------------

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  // -----------------------------------------
  // RESET FILTERS
  // -----------------------------------------

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setUniqueCategory("");
    setStatus("");
  };

  // -----------------------------------------
  // PAGE CHANGE
  // -----------------------------------------

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }

    fetchProducts(page);
  };

  // -----------------------------------------
  // DEACTIVATE PRODUCT
  // -----------------------------------------

  const handleToggleStatus = async (product) => {
    const activating = !product.isActive;

    const result = await Swal.fire({
      icon: activating ? "question" : "warning",
      title: activating ? "Activate Product?" : "Deactivate Product?",
      text: activating
        ? "This product will become visible to customers."
        : "This product will be hidden from customers.",
      showCancelButton: true,
      confirmButtonText: activating ? "Activate" : "Deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: activating ? "#000000" : "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const { data } = await axios.put(
        `${API_URL}/products/${product._id}`,
        { isActive: activating },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await Swal.fire({
        icon: "success",
        title: activating ? "Product Activated" : "Product Deactivated",
        text:
          data.message ||
          `Product ${activating ? "activated" : "deactivated"} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchProducts();
    } catch (error) {
      console.error("Failed to update product status:", error);

      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text:
          error.response?.data?.message || "Unable to update product status.",
        confirmButtonColor: "#000000",
      });
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading products...</p>
      </div>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <section className="min-h-screen bg-[#faf9f6]">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                Mehaa Garments
              </p>

              <h1 className="text-2xl md:text-3xl font-serif text-gray-900">
                Products
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Manage your saree collection and inventory.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/products/add")}
              className="
                bg-black
                text-white
                px-6
                py-3
                text-sm
                font-medium
                transition
                hover:bg-gray-800
                w-fit
              "
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ===================================
            FILTERS
        =================================== */}

        <div className="bg-white border border-gray-200 p-5 mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            {/* SEARCH */}

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Search Products
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name..."
                className="
                  w-full
                  h-11
                  border
                  border-gray-300
                  px-4
                  text-sm
                  outline-none
                  focus:border-black
                "
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={handleCategoryChange}
                className="
                  w-full
                  h-11
                  border
                  border-gray-300
                  px-3
                  text-sm
                  bg-white
                  outline-none
                  focus:border-black
                "
              >
                <option value="">All Categories</option>

                {categories.map((item) => (
                  <option key={item._id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* UNIQUE CATEGORY */}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Unique Collection
              </label>

              <select
                value={uniqueCategory}
                onChange={handleUniqueCategoryChange}
                className="w-full h-11 border border-gray-300 px-3 text-sm bg-white outline-none focus:border-black"
              >
                <option value="">All Unique Collections</option>

                {uniqueCategories.map((item) => (
                  <option key={item._id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Status
              </label>

              <select
                value={status}
                onChange={handleStatusChange}
                className="
                  w-full
                  h-11
                  border
                  border-gray-300
                  px-3
                  text-sm
                  bg-white
                  outline-none
                  focus:border-black
                "
              >
                <option value="">All Products</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>

          {/* FILTER BUTTONS */}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => fetchProducts(1)}
              className="
                bg-black
                text-white
                px-5
                py-2.5
                text-sm
                hover:bg-gray-800
              "
            >
              Apply Filters
            </button>

            <button
              onClick={handleReset}
              className="
                border
                border-gray-300
                px-5
                py-2.5
                text-sm
                hover:border-black
              "
            >
              Reset
            </button>
          </div>
        </div>

        {/* ===================================
            ERROR
        =================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ===================================
            SUMMARY
        =================================== */}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {pagination.totalProducts}{" "}
            {pagination.totalProducts === 1 ? "product" : "products"}
          </p>

          {loading && <p className="text-xs text-gray-400">Updating...</p>}
        </div>

        {/* ===================================
            PRODUCTS TABLE
        =================================== */}

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-225">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Collections
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Featured
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-16 text-center">
                      <p className="text-gray-500 text-sm">
                        No products found.
                      </p>

                      <button
                        onClick={handleReset}
                        className="mt-3 text-sm underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const productImage = product.image;

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50 transition"
                      >
                        {/* PRODUCT */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-16 bg-gray-100 shrink-0 overflow-hidden">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-62.5">
                                {product.name}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                ID: {product._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {product.category ? (
                              <span className="text-sm text-gray-600 capitalize">
                                {product.category.replace(/-/g, " ")}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No normal category
                              </span>
                            )}

                            {Array.isArray(product.uniqueCategories) &&
                              product.uniqueCategories.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {product.uniqueCategories.map(
                                    (collection) => (
                                      <span
                                        key={collection._id}
                                        className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                      >
                                        {collection.name}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium">
                              ₹
                              {Number(product.price || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>

                            {product.oldPrice > product.price && (
                              <p className="text-xs text-gray-400 line-through mt-1">
                                ₹
                                {Number(product.oldPrice).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4">
                          <span
                            className={
                              product.stock === 0
                                ? "text-red-600 text-sm"
                                : product.stock <= 5
                                  ? "text-orange-600 text-sm"
                                  : "text-gray-700 text-sm"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {product.isActive ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* FEATURED */}

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {product.isFeatured && (
                              <span className="text-xs text-purple-600">
                                Featured
                              </span>
                            )}

                            {product.isBestSeller && (
                              <span className="text-xs text-orange-600">
                                Best Seller
                              </span>
                            )}

                            {!product.isFeatured && !product.isBestSeller && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/products/edit/${product._id}`)
                              }
                              className="px-3 py-2 text-xs border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                            >
                              Edit
                            </button>

                            {/* DEACTIVATE */}

                            {product.isActive ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(product)}
                                className="px-3 py-2 text-xs border border-red-200 text-red-600 hover:border-red-500 hover:text-red-700"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(product)}
                                className="px-3 py-2 text-xs border border-green-200 text-green-600 hover:border-green-500 hover:text-green-700"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================
            PAGINATION
        =================================== */}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="
                px-4
                py-2
                border
                border-gray-300
                text-sm
                disabled:opacity-30
                disabled:cursor-not-allowed
              "
            >
              Previous
            </button>

            <span className="px-4 text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="
                px-4
                py-2
                border
                border-gray-300
                text-sm
                disabled:opacity-30
                disabled:cursor-not-allowed
              "
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminProducts;
