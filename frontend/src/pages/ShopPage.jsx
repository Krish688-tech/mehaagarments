import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import useSEO from "../hooks/useSEO";
import { ChevronDown, Search, X, SlidersHorizontal } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const SORT_OPTIONS = [
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const DEFAULT_PAGINATION = {
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 12,
  hasNextPage: false,
  hasPreviousPage: false,
};

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);

  // =========================================================
  // NORMAL CATEGORIES
  // =========================================================

  const [categories, setCategories] = useState([]);

  // =========================================================
  // UNIQUE COLLECTIONS
  // =========================================================

  const [uniqueCategories, setUniqueCategories] = useState([]);

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uniqueCategoriesLoading, setUniqueCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // =========================================================
  // URL FILTER STATE
  // =========================================================

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const uniqueCategory = searchParams.get("uniqueCategory") || "";
  const sort = searchParams.get("sort") || "best-selling";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const appliedMinPrice = searchParams.get("minPrice") || "";
  const appliedMaxPrice = searchParams.get("maxPrice") || "";

  // =========================================================
  // LOCAL FILTER STATE
  // =========================================================

  const [searchInput, setSearchInput] = useState(search);
  const [minPrice, setMinPrice] = useState(appliedMinPrice);
  const [maxPrice, setMaxPrice] = useState(appliedMaxPrice);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // =========================================================
  // SYNC SEARCH INPUT
  // =========================================================

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // =========================================================
  // SYNC PRICE INPUTS
  // =========================================================

  useEffect(() => {
    setMinPrice(appliedMinPrice);
    setMaxPrice(appliedMaxPrice);
  }, [appliedMinPrice, appliedMaxPrice]);

  // =========================================================
  // FETCH NORMAL CATEGORIES
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const { data } = await axios.get(`${API_URL}/categories`, {
          signal: controller.signal,
        });

        const categoryList = Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
            ? data.categories
            : [];

        setCategories(categoryList);
      } catch (error) {
        if (error.name === "CanceledError") return;

        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  // =========================================================
  // FETCH UNIQUE COLLECTIONS
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchUniqueCategories = async () => {
      try {
        setUniqueCategoriesLoading(true);

        const { data } = await axios.get(`${API_URL}/unique-categories`, {
          signal: controller.signal,
        });

        const collectionList = Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
            ? data.categories
            : [];

        setUniqueCategories(collectionList);
      } catch (error) {
        if (error.name === "CanceledError") return;

        console.error("Failed to fetch unique collections:", error);

        setUniqueCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setUniqueCategoriesLoading(false);
        }
      }
    };

    fetchUniqueCategories();

    return () => {
      controller.abort();
    };
  }, []);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", 12);
        params.append("sort", sort);

        if (search.trim()) {
          params.append("search", search.trim());
        }

        if (category) {
          params.append("category", category);
        }

        if (uniqueCategory) {
          params.append("uniqueCategory", uniqueCategory);
        }

        if (appliedMinPrice !== "") {
          params.append("minPrice", appliedMinPrice);
        }

        if (appliedMaxPrice !== "") {
          params.append("maxPrice", appliedMaxPrice);
        }

        const { data } = await axios.get(
          `${API_URL}/products?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        setProducts(Array.isArray(data.products) ? data.products : []);

        setPagination(
          data.pagination || {
            ...DEFAULT_PAGINATION,
            currentPage: page,
          },
        );
      } catch (error) {
        if (error.name === "CanceledError") return;

        console.error("Failed to fetch products:", error);

        setProducts([]);
        setPagination(DEFAULT_PAGINATION);

        setError(
          error.response?.data?.message ||
            "Unable to load the collection. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [
    search,
    category,
    uniqueCategory,
    sort,
    page,
    appliedMinPrice,
    appliedMaxPrice,
  ]);

  useSEO({
    title:
      "Buy Sarees Online | Cotton, Silk, Designer & Daily Wear | Mehaa Garments",
    description:
      "Explore sarees online at Mehaa Garments, from elegant cotton and silk sarees to designer styles and everyday wear. Discover thoughtfully curated collections for festive celebrations, traditional occasions and effortless everyday elegance.",
    canonicalUrl: "https://www.mehaagarments.in/shop",
  });

  // =========================================================
  // UPDATE URL PARAMETERS
  // =========================================================

  const updateParams = (updates = {}) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";

      if (searchInput.trim() === currentSearch) {
        return;
      }

      updateParams({
        search: searchInput.trim(),
        page: 1,
      });
    }, 450);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // =========================================================
  // NORMAL CATEGORY
  // =========================================================

  const handleCategoryChange = (value) => {
    updateParams({
      category: value,
      uniqueCategory: "",
      page: 1,
    });

    setFilterOpen(false);
  };

  // =========================================================
  // UNIQUE CATEGORY
  // =========================================================

  const handleUniqueCategoryChange = (value) => {
    updateParams({
      uniqueCategory: value,
      category: "",
      page: 1,
    });

    setFilterOpen(false);
  };

  // =========================================================
  // SORT
  // =========================================================

  const handleSortChange = (value) => {
    updateParams({
      sort: value,
      page: 1,
    });

    setSortOpen(false);
  };

  // =========================================================
  // PRICE FILTER
  // =========================================================

  const applyPriceFilter = () => {
    let min = minPrice === "" ? "" : Number(minPrice);

    let max = maxPrice === "" ? "" : Number(maxPrice);

    if (min !== "" && Number.isNaN(min)) {
      min = "";
    }

    if (max !== "" && Number.isNaN(max)) {
      max = "";
    }

    if (min !== "" && min < 0) {
      min = 0;
    }

    if (max !== "" && max < 0) {
      max = 0;
    }

    if (min !== "" && max !== "" && max < min) {
      max = min;
    }

    updateParams({
      minPrice: min,
      maxPrice: max,
      page: 1,
    });

    setFilterOpen(false);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchInput("");
    setMinPrice("");
    setMaxPrice("");

    setSearchParams({
      sort: "best-selling",
      page: "1",
    });

    setFilterOpen(false);
  };

  // =========================================================
  // RESULT TEXT
  // =========================================================

  const resultText = useMemo(() => {
    if (loading) {
      return "Loading collection...";
    }

    if (pagination.totalProducts === 0) {
      return "No sarees found";
    }

    return `${pagination.totalProducts} ${
      pagination.totalProducts === 1 ? "saree" : "sarees"
    }`;
  }, [loading, pagination.totalProducts]);

  // =========================================================
  // PRODUCT CLICK
  // =========================================================

  const handleProductClick = (product) => {
    const productCategory = product.category || "all";

    navigate(`/collection/${productCategory}/specification/${product._id}`);
  };

  // =========================================================
  // DISCOUNT
  // =========================================================

  const getDiscount = (product) => {
    const price = Number(product.price) || 0;
    const oldPrice = Number(product.oldPrice) || 0;

    if (oldPrice <= price || oldPrice <= 0) {
      return 0;
    }

    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  // =========================================================
  // NORMAL CATEGORY NAME
  // =========================================================

  const getCategoryName = (slug) => {
    const found = categories.find((item) => item.slug === slug);

    if (found?.name) {
      return found.name;
    }

    return slug
      ? slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "All Sarees";
  };

  // =========================================================
  // UNIQUE CATEGORY NAME
  // =========================================================

  const getUniqueCategoryName = (slug) => {
    const found = uniqueCategories.find((item) => item.slug === slug);

    if (found?.name) {
      return found.name;
    }

    return slug
      ? slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      : "Our Unique Collections";
  };

  // =========================================================
  // ACTIVE FILTER NAME
  // =========================================================

  const activeCollectionName = useMemo(() => {
    if (uniqueCategory) {
      return getUniqueCategoryName(uniqueCategory);
    }

    if (category) {
      return getCategoryName(category);
    }

    return "";
  }, [category, uniqueCategory, categories, uniqueCategories]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    updateParams({
      page: newPage,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // PAGINATION NUMBERS
  // =========================================================

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;

    if (total <= 1) {
      return [];
    }

    const pages = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(total - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < total - 2) {
      pages.push("...");
    }

    pages.push(total);

    return pages;
  }, [page, pagination.totalPages]);

  // =========================================================
  // HAS ACTIVE FILTERS
  // =========================================================

  const hasActiveFilters = Boolean(
    search || category || uniqueCategory || appliedMinPrice || appliedMaxPrice,
  );

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#171717]">
      {/* =====================================================
          HERO / PAGE INTRO
      ===================================================== */}

      <section className="pt-32 pb-12 px-5 sm:px-8 lg:px-12 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 mb-5">
              Mehaa Garments
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight">
              The Saree Collection
            </h1>

            <p className="mt-5 text-sm sm:text-base text-gray-500 leading-7 max-w-xl mx-auto">
              Discover timeless weaves, graceful textures and elegant sarees
              curated for every occasion.
            </p>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="max-w-2xl mx-auto mt-10">
            <div className="relative">
              <Search
                size={19}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search sarees, fabrics, styles..."
                className="w-full h-14 pl-13 pr-12 rounded-full bg-white border border-gray-200 outline-none focus:border-black transition shadow-sm text-sm"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SHOP CONTENT
      ===================================================== */}

      <section className="px-5 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* =================================================
              NORMAL CATEGORY NAVIGATION
          ================================================= */}

          <div className="hidden md:flex items-center justify-center gap-2 flex-wrap mb-6">
            <button
              type="button"
              onClick={() => handleCategoryChange("")}
              className={`px-5 py-2.5 rounded-full text-sm transition ${
                !category && !uniqueCategory
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:text-black border border-gray-200"
              }`}
            >
              All Sarees
            </button>

            {!categoriesLoading &&
              categories.map((item) => (
                <button
                  key={item._id || item.slug}
                  type="button"
                  onClick={() => handleCategoryChange(item.slug)}
                  className={`px-5 py-2.5 rounded-full text-sm transition ${
                    category === item.slug
                      ? "bg-black text-white"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  {item.name}
                </button>
              ))}
          </div>

          {/* =================================================
              UNIQUE COLLECTION NAVIGATION
          ================================================= */}

          {!uniqueCategoriesLoading && uniqueCategories.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
              <span className="w-full text-center text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-1">
                Our Unique Collections
              </span>

              {uniqueCategories.map((item) => (
                <button
                  key={item._id || item.slug}
                  type="button"
                  onClick={() => handleUniqueCategoryChange(item.slug)}
                  className={`px-5 py-2.5 rounded-full text-sm transition ${
                    uniqueCategory === item.slug
                      ? "bg-black text-white"
                      : "bg-white text-gray-600 hover:text-black border border-gray-200"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="flex items-center justify-between gap-4 mb-8 border-y border-gray-200 py-5">
            <div>
              <p className="text-sm text-gray-500">{resultText}</p>

              {activeCollectionName && (
                <p className="text-xs text-gray-400 mt-1">
                  Showing {activeCollectionName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter */}

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              {/* Sort */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  className="flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm min-w-38 justify-between"
                >
                  <span>
                    {SORT_OPTIONS.find((item) => item.value === sort)?.label ||
                      "Best Selling"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-12 z-30 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl p-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                          sort === option.value
                            ? "bg-black text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              MAIN SHOP AREA
          ================================================= */}

          <div className="grid lg:grid-cols-[230px_1fr] gap-10">
            {/* =================================================
                DESKTOP FILTERS
            ================================================= */}

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-serif text-2xl">Filters</h2>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-black underline underline-offset-4"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* =================================================
                    NORMAL CATEGORIES
                ================================================= */}

                <div className="border-t border-gray-200 py-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                    Category
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("")}
                      className={`flex items-center justify-between w-full text-sm ${
                        !category && !uniqueCategory
                          ? "text-black font-medium"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      <span>All Sarees</span>

                      {!category && !uniqueCategory && <span>✓</span>}
                    </button>

                    {categories.map((item) => (
                      <button
                        key={item._id || item.slug}
                        type="button"
                        onClick={() => handleCategoryChange(item.slug)}
                        className={`flex items-center justify-between w-full text-sm ${
                          category === item.slug
                            ? "text-black font-medium"
                            : "text-gray-500 hover:text-black"
                        }`}
                      >
                        <span>{item.name}</span>

                        {category === item.slug && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* =================================================
                    UNIQUE COLLECTIONS
                ================================================= */}

                {!uniqueCategoriesLoading && uniqueCategories.length > 0 && (
                  <div className="border-t border-gray-200 py-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Unique Collections
                    </p>

                    <div className="space-y-3">
                      {uniqueCategories.map((item) => (
                        <button
                          key={item._id || item.slug}
                          type="button"
                          onClick={() => handleUniqueCategoryChange(item.slug)}
                          className={`flex items-center justify-between w-full text-sm ${
                            uniqueCategory === item.slug
                              ? "text-black font-medium"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          <span>{item.name}</span>

                          {uniqueCategory === item.slug && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="border-t border-gray-200 py-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                    Price
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Minimum</label>

                      <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="₹ Min"
                        className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400">Maximum</label>

                      <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="₹ Max"
                        className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={applyPriceFilter}
                    className="w-full mt-4 py-2.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
                  >
                    Apply Price
                  </button>
                </div>
              </div>
            </aside>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div>
              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="aspect-4/5 rounded-3xl bg-gray-200" />

                      <div className="mt-5 h-4 bg-gray-200 rounded w-4/5" />

                      <div className="mt-3 h-4 bg-gray-200 rounded w-2/5" />
                    </div>
                  ))}
                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {!loading && error && (
                <div className="min-h-80 flex flex-col items-center justify-center text-center">
                  <p className="font-serif text-2xl">Something went wrong</p>

                  <p className="text-sm text-gray-500 mt-3 max-w-md">{error}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-3 rounded-full bg-black text-white text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loading && !error && products.length === 0 && (
                <div className="min-h-80 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Search size={22} className="text-gray-400" />
                  </div>

                  <h2 className="font-serif text-2xl mt-6">No sarees found</h2>

                  <p className="text-sm text-gray-500 mt-2 max-w-sm">
                    Try another search or clear your filters to explore the
                    complete collection.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 px-6 py-3 rounded-full bg-black text-white text-sm"
                  >
                    View All Sarees
                  </button>
                </div>
              )}

              {/* =================================================
                  PRODUCT GRID
              ================================================= */}

              {!loading && !error && products.length > 0 && (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-12">
                    {products.map((product) => {
                      const discount = getDiscount(product);

                      return (
                        <article
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          className="group cursor-pointer"
                        >
                          {/* PRODUCT IMAGE */}

                          <div className="relative overflow-hidden rounded-3xl bg-white aspect-4/5">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* DISCOUNT */}

                            {discount > 0 && (
                              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] uppercase tracking-wider font-medium">
                                Save {discount}%
                              </span>
                            )}

                            {/* BEST SELLER */}

                            {product.isBestSeller && (
                              <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black text-white text-[10px] uppercase tracking-wider">
                                Best Seller
                              </span>
                            )}

                            {/* OUT OF STOCK */}

                            {Number(product.stock) <= 0 && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <span className="px-4 py-2 rounded-full bg-white text-xs uppercase tracking-wider">
                                  Sold Out
                                </span>
                              </div>
                            )}

                            {/* HOVER CTA */}

                            {Number(product.stock) > 0 && (
                              <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    handleProductClick(product);
                                  }}
                                  className="w-full py-3 rounded-full bg-white/95 backdrop-blur-sm text-black text-xs font-medium shadow-lg"
                                >
                                  View Product
                                </button>
                              </div>
                            )}
                          </div>

                          {/* PRODUCT DETAILS */}

                          <div className="pt-5 px-1">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2">
                              {getCategoryName(product.category)}
                            </p>

                            <h3 className="font-serif text-lg sm:text-xl leading-snug line-clamp-2">
                              {product.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-sm sm:text-base font-medium">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </span>

                              {Number(product.oldPrice) >
                                Number(product.price) && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through">
                                  ₹
                                  {Number(product.oldPrice).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              )}
                            </div>

                            {/* RATING */}

                            {product.rating > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <span>★</span>

                                <span>{Number(product.rating).toFixed(1)}</span>

                                {product.reviews > 0 && (
                                  <span>({product.reviews})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* =================================================
                        PAGINATION
                    ================================================= */}

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-16">
                      <button
                        type="button"
                        disabled={!pagination.hasPreviousPage}
                        onClick={() => goToPage(page - 1)}
                        className="px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {pageNumbers.map((item, index) =>
                          item === "..." ? (
                            <span
                              key={`dots-${index}`}
                              className="w-9 text-center text-gray-400"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => goToPage(item)}
                              className={`w-10 h-10 rounded-full text-sm transition ${
                                page === item
                                  ? "bg-black text-white"
                                  : "bg-white border border-gray-200 hover:border-black"
                              }`}
                            >
                              {item}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!pagination.hasNextPage}
                        onClick={() => goToPage(page + 1)}
                        className="px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MOBILE FILTER DRAWER
      ========================================================= */}

      {filterOpen && (
        <div className="fixed inset-0 z-1000 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterOpen(false)}
          />

          <aside className="absolute right-0 top-0 h-full w-[88%] max-w-md bg-[#faf9f7] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-[#faf9f7]/95 backdrop-blur-md border-b border-gray-200 px-6 py-5 flex items-center justify-between z-10">
              <h2 className="font-serif text-2xl">Filters</h2>

              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center"
                aria-label="Close filters"
              >
                <X size={19} />
              </button>
            </div>

            <div className="px-6 py-7">
              {/* =================================================
                  MOBILE NORMAL CATEGORIES
              ================================================= */}

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                  Category
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                      !category && !uniqueCategory
                        ? "bg-black text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    All Sarees
                    {!category && !uniqueCategory && <span>✓</span>}
                  </button>

                  {categories.map((item) => (
                    <button
                      key={item._id || item.slug}
                      type="button"
                      onClick={() => handleCategoryChange(item.slug)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                        category === item.slug
                          ? "bg-black text-white"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {item.name}

                      {category === item.slug && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* =================================================
                  MOBILE UNIQUE COLLECTIONS
              ================================================= */}

              {!uniqueCategoriesLoading && uniqueCategories.length > 0 && (
                <div className="border-t border-gray-200 mt-8 pt-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                    Unique Collections
                  </p>

                  <div className="space-y-2">
                    {uniqueCategories.map((item) => (
                      <button
                        key={item._id || item.slug}
                        type="button"
                        onClick={() => handleUniqueCategoryChange(item.slug)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                          uniqueCategory === item.slug
                            ? "bg-black text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        {item.name}

                        {uniqueCategory === item.slug && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================
                  MOBILE PRICE
              ================================================= */}

              <div className="border-t border-gray-200 mt-8 pt-8">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">
                  Price Range
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ₹"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm outline-none focus:border-black"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ₹"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm outline-none focus:border-black"
                  />
                </div>

                <button
                  type="button"
                  onClick={applyPriceFilter}
                  className="w-full mt-4 py-3.5 rounded-full bg-black text-white text-sm"
                >
                  Apply Price
                </button>
              </div>

              {/* =================================================
                  MOBILE CLEAR
              ================================================= */}

              <button
                type="button"
                onClick={clearFilters}
                className="w-full mt-4 py-3.5 rounded-full border border-gray-300 text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default ShopPage;
