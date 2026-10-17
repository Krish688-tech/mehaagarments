import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CollectionPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);

  // =========================================================
  // CATEGORY
  // =========================================================

  const [categoryData, setCategoryData] = useState(null);
  const [uniqueCategoryData, setUniqueCategoryData] = useState(null);

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // SORT
  // =========================================================

  const [sortOption, setSortOption] = useState("best-selling");
  const [sortOpen, setSortOpen] = useState(false);

  // =========================================================
  // FILTER DROPDOWNS
  // =========================================================

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  // =========================================================
  // PRICE FILTER
  // =========================================================

  const [minPrice, setMinPrice] = useState(250);
  const [maxPrice, setMaxPrice] = useState(50000);

  // Values actually sent to backend
  const [appliedMinPrice, setAppliedMinPrice] = useState(250);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(50000);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =========================================================
  // FETCH CATEGORY
  // =========================================================

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const [categoryResponse, uniqueCategoryResponse] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/unique-categories`),
        ]);

        const categories = Array.isArray(categoryResponse.data?.categories)
          ? categoryResponse.data.categories
          : [];

        const uniqueCategories = Array.isArray(
          uniqueCategoryResponse.data?.categories,
        )
          ? uniqueCategoryResponse.data.categories
          : Array.isArray(uniqueCategoryResponse.data?.uniqueCategories)
            ? uniqueCategoryResponse.data.uniqueCategories
            : [];

        const foundCategory = categories.find((item) => item.slug === category);

        const foundUniqueCategory = uniqueCategories.find(
          (item) => item.slug === category,
        );

        setCategoryData(foundCategory || null);
        setUniqueCategoryData(foundUniqueCategory || null);
      } catch (error) {
        console.error("Failed to fetch collection data:", error);

        setCategoryData(null);
        setUniqueCategoryData(null);
      }
    };

    if (category) {
      fetchCollectionData();
    }
  }, [category]);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        // Collection
        if (uniqueCategoryData) {
          params.append("uniqueCategory", category);
        } else {
          params.append("category", category);
        }

        // Sorting
        params.append("sort", sortOption);

        // Pagination
        params.append("page", page);
        params.append("limit", 12);

        // Price filtering
        params.append("minPrice", appliedMinPrice);
        params.append("maxPrice", appliedMaxPrice);

        const { data } = await axios.get(
          `${API_URL}/products?${params.toString()}`,
        );

        setProducts(data.products || []);

        setPagination(
          data.pagination || {
            totalProducts: 0,
            totalPages: 1,
            currentPage: 1,
            limit: 12,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);

        setProducts([]);

        setError(
          error.response?.data?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [
    category,
    uniqueCategoryData,
    sortOption,
    page,
    appliedMinPrice,
    appliedMaxPrice,
  ]);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  useEffect(() => {
    setPage(1);
  }, [category]);

  // =========================================================
  // SORT CHANGE
  // =========================================================

  const handleSortChange = (value) => {
    setSortOption(value);
    setSortOpen(false);
    setPage(1);
  };

  // =========================================================
  // PRICE FILTER
  // =========================================================

  const applyPriceFilter = () => {
    let min = Number(minPrice);
    let max = Number(maxPrice);

    if (Number.isNaN(min)) {
      min = 250;
    }

    if (Number.isNaN(max)) {
      max = 50000;
    }

    if (min < 0) {
      min = 0;
    }

    if (max < min) {
      max = min;
    }

    setMinPrice(min);
    setMaxPrice(max);

    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);

    setPage(1);
  };

  // =========================================================
  // CLEAR PRICE FILTER
  // =========================================================

  const clearPriceFilter = () => {
    setMinPrice(250);
    setMaxPrice(50000);

    setAppliedMinPrice(250);
    setAppliedMaxPrice(50000);

    setPage(1);
  };

  // =========================================================
  // CATEGORY TITLE
  // =========================================================

  const collectionData = uniqueCategoryData || categoryData;

  const categoryTitle =
    collectionData?.name ||
    `${category
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} Sarees`;

  const seoTitle = (() => {
    const name = collectionData?.name || categoryTitle;

    if (uniqueCategoryData) {
      const uniqueSeoTitles = {
        "cotton-elegance": "Cotton Saree Collection",
        "silk-heritage": "Silk Saree Collection",
        "festive-glow": "Festive Saree Collection",
        "modern-tradition": "Traditional & Contemporary Sarees",
        "royal-weaves": "Premium Saree Collection",
      };

      const title = uniqueSeoTitles[category];

      return title
        ? `${title} | Mehaa Garments`
        : `${name} | Saree Collection | Mehaa Garments`;
    }

    const categorySeoTitles = {
      "cotton-sarees": "Buy Cotton Sarees Online",
      "silk-sarees": "Shop Silk Sarees Online",
      "designer-sarees": "Shop Designer Sarees Online",
      "daily-wear": "Daily Wear Sarees Online",
    };

    const title = categorySeoTitles[category];

    return title
      ? `${title} | Mehaa Garments`
      : `${name} | Shop Sarees Online | Mehaa Garments`;
  })();

  const seoDescription = uniqueCategoryData
    ? `Explore the ${collectionData?.name || categoryTitle} collection at Mehaa Garments. Discover beautiful sarees for celebrations, traditional occasions and everyday elegance.`
    : `Explore ${collectionData?.name || categoryTitle} at Mehaa Garments. Shop sarees online and discover beautiful styles for everyday wear, celebrations and special occasions.`;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: `https://mehaagarments.in/collections/${category}`,
  });

  // =========================================================
  // CATEGORY IMAGE
  // =========================================================

  const categoryImage =
    collectionData?.image ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bg-[#f8f8f8] min-h-screen">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative w-full h-[50vh] overflow-hidden">
        <img
          src={categoryImage}
          alt={categoryTitle}
          className="w-full h-full object-cover scale-105"
        />

        <div className="absolute inset-0 bg-black/45"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <p className="uppercase tracking-[8px] text-sm opacity-80">
            Mehaa Garments
          </p>

          <h1 className="playfair text-5xl md:text-7xl font-semibold mt-5">
            {categoryTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl opacity-90 leading-relaxed">
            {categoryData?.description ||
              "Elegant handcrafted sarees designed for timeless beauty and modern sophistication."}
          </p>

          <button
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              });
            }}
            className="mt-10 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-black hover:text-white transition-all duration-500"
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* =====================================================
          MAIN SECTION
      ===================================================== */}

      <div className="max-w-400 mx-auto px-4 md:px-10 lg:px-14 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* =================================================
              FILTER SIDEBAR
          ================================================= */}

          <div className="w-full lg:w-[320px]">
            <div
              className="sticky top-28 bg-white/70 backdrop-blur-2xl
              border border-white/40 rounded-4xl
              shadow-xl p-6 md:p-8"
            >
              <h2 className="playfair text-3xl mb-8 text-black">Filters</h2>

              {/* =================================================
                  AVAILABILITY
              ================================================= */}

              <div className="border-b border-gray-200 pb-6 mb-6">
                <button
                  onClick={() => setAvailabilityOpen(!availabilityOpen)}
                  className="w-full flex justify-between items-center"
                >
                  <h3 className="text-lg font-medium">Availability</h3>

                  <ChevronDown
                    size={18}
                    className={`transition duration-300 ${
                      availabilityOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    availabilityOpen
                      ? "max-h-40 opacity-100 mt-5"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-gray-600 text-[15px]">
                    {pagination.totalProducts} products available
                  </div>
                </div>
              </div>

              {/* =================================================
                  PRICE
              ================================================= */}

              <div>
                <button
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="w-full flex justify-between items-center"
                >
                  <h3 className="text-lg font-medium">Price</h3>

                  <ChevronDown
                    size={18}
                    className={`transition duration-300 ${
                      priceOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    priceOpen
                      ? "max-h-125 opacity-100 mt-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {/* RANGE */}

                  <input
                    type="range"
                    min="250"
                    max="50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />

                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span>₹250</span>

                    <span>₹{maxPrice}</span>
                  </div>

                  {/* INPUTS */}

                  <div className="flex gap-3 mt-6">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-1/2 rounded-2xl border border-gray-200
                      px-4 py-3 outline-none bg-white/70"
                      placeholder="Min"
                    />

                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-1/2 rounded-2xl border border-gray-200
                      px-4 py-3 outline-none bg-white/70"
                      placeholder="Max"
                    />
                  </div>

                  {/* APPLY */}

                  <button
                    onClick={applyPriceFilter}
                    className="w-full mt-6 bg-black text-white
                    py-4 rounded-full hover:scale-[1.02]
                    transition duration-300"
                  >
                    Apply Filters
                  </button>

                  {/* CLEAR */}

                  {(appliedMinPrice !== 250 || appliedMaxPrice !== 50000) && (
                    <button
                      onClick={clearPriceFilter}
                      className="w-full mt-3 py-3 text-sm
                      text-gray-500 hover:text-black transition"
                    >
                      Clear Price Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCTS SECTION
          ================================================= */}

          <div className="flex-1">
            {/* =================================================
                TOP BAR
            ================================================= */}

            <div
              className="flex flex-col md:flex-row md:items-center
              justify-between gap-5 mb-10"
            >
              <p className="text-gray-500 text-lg">
                {loading
                  ? "Loading products..."
                  : `${pagination.totalProducts} products`}
              </p>

              {/* SORT */}

              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="w-full md:w-auto flex items-center justify-between
                  gap-4 px-6 py-4 rounded-full bg-white/70
                  backdrop-blur-xl border border-white/40 shadow-lg"
                >
                  <span>
                    {sortOption === "best-selling" && "Best Selling"}

                    {sortOption === "low-high" && "Price: Low to High"}

                    {sortOption === "high-low" && "Price: High to Low"}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`transition duration-300 ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 mt-4 w-full md:w-64
                  rounded-3xl bg-white/70 backdrop-blur-2xl
                  border border-white/40 shadow-2xl overflow-hidden
                  transition-all duration-300 z-50 ${
                    sortOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <button
                    onClick={() => handleSortChange("best-selling")}
                    className="w-full px-6 py-4 text-left hover:bg-white/50"
                  >
                    Best Selling
                  </button>

                  <button
                    onClick={() => handleSortChange("low-high")}
                    className="w-full px-6 py-4 text-left hover:bg-white/50"
                  >
                    Price: Low to High
                  </button>

                  <button
                    onClick={() => handleSortChange("high-low")}
                    className="w-full px-6 py-4 text-left hover:bg-white/50"
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="w-full h-120 bg-gray-200 rounded-4xl"></div>

                    <div className="mt-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>

                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div className="py-20 text-center">
                <h2 className="text-2xl font-medium text-black">
                  Something went wrong
                </h2>

                <p className="mt-3 text-gray-500">{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-3 rounded-full bg-black text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading && !error && products.length === 0 && (
              <div className="py-20 text-center">
                <h2 className="playfair text-3xl text-black">
                  No Sarees Found
                </h2>

                <p className="mt-4 text-gray-500">
                  No products are available in this collection with the selected
                  filters.
                </p>

                <button
                  onClick={clearPriceFilter}
                  className="mt-6 px-7 py-3 rounded-full bg-black text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* =================================================
                MOBILE PRODUCTS
            ================================================= */}

            {!loading && !error && products.length > 0 && (
              <div className="flex flex-col gap-8 md:hidden">
                {products.map((item) => {
                  const discount =
                    item.oldPrice > item.price
                      ? Math.round(
                          ((item.oldPrice - item.price) / item.oldPrice) * 100,
                        )
                      : 0;

                  return (
                    <div
                      key={item._id}
                      onClick={() =>
                        navigate(
                          `/collection/${category}/specification/${item._id}`,
                        )
                      }
                      className="group bg-white rounded-4xl
                        overflow-hidden shadow-lg cursor-pointer"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-125 object-cover
                            transition duration-700 group-hover:scale-105"
                        />

                        {discount > 0 && (
                          <div
                            className="absolute top-5 left-5
                              bg-red-600 text-white text-xs
                              px-4 py-2 rounded-full"
                          >
                            SAVE {discount}%
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="playfair text-2xl text-black leading-snug">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-2xl text-red-600 font-medium">
                            ₹{item.price}
                          </span>

                          {item.oldPrice > item.price && (
                            <span className="line-through text-gray-400">
                              ₹{item.oldPrice}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            navigate(
                              `/collection/${category}/specification/${item._id}`,
                            );
                          }}
                          className="mt-6 w-full py-4 rounded-full bg-black text-white"
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =================================================
                DESKTOP PRODUCTS
            ================================================= */}

            {!loading && !error && products.length > 0 && (
              <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((item) => {
                  const discount =
                    item.oldPrice > item.price
                      ? Math.round(
                          ((item.oldPrice - item.price) / item.oldPrice) * 100,
                        )
                      : 0;

                  return (
                    <div
                      key={item._id}
                      onClick={() =>
                        navigate(
                          `/collection/${category}/specification/${item._id}`,
                        )
                      }
                      className="group cursor-pointer
                        transition-all duration-500
                        hover:-translate-y-2"
                    >
                      <div
                        className="relative overflow-hidden
                          rounded-4xl bg-white shadow-sm
                          hover:shadow-2xl
                          transition-all duration-500"
                      >
                        {discount > 0 && (
                          <div
                            className="absolute top-5 left-5 z-10
                              bg-red-600 text-white text-xs
                              px-4 py-2 rounded-full"
                          >
                            SAVE {discount}%
                          </div>
                        )}

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-120 object-cover
                            transition-transform duration-700
                            group-hover:scale-110"
                        />
                      </div>

                      <div className="mt-5 px-1">
                        <h3 className="playfair text-2xl text-gray-800">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-3 mt-4">
                          <span className="text-red-600 text-2xl font-medium">
                            ₹{item.price}
                          </span>

                          {item.oldPrice > item.price && (
                            <span className="line-through text-gray-400">
                              ₹{item.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading && !error && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => {
                    setPage((previous) => Math.max(previous - 1, 1));

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="px-5 py-3 rounded-full border
                    border-gray-300 disabled:opacity-30
                    disabled:cursor-not-allowed
                    hover:bg-black hover:text-white
                    transition"
                >
                  Previous
                </button>

                <div className="px-5 py-3 rounded-full bg-black text-white">
                  {pagination.currentPage} / {pagination.totalPages}
                </div>

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => {
                    setPage((previous) =>
                      Math.min(previous + 1, pagination.totalPages),
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="px-5 py-3 rounded-full border
                    border-gray-300 disabled:opacity-30
                    disabled:cursor-not-allowed
                    hover:bg-black hover:text-white
                    transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
