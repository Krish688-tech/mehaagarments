
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import {
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_MIN_PRICE = 250;
const DEFAULT_MAX_PRICE = 50000;
const PAGE_LIMIT = 12;

const SORT_OPTIONS = [
  { value: "best-selling", label: "Best Selling" },
  { value: "low-high", label: "Price: Low to High" },
  { value: "high-low", label: "Price: High to Low" },
];

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const CollectionPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [uniqueCategoryData, setUniqueCategoryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOption, setSortOption] = useState("best-selling");
  const [sortOpen, setSortOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [appliedMinPrice, setAppliedMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    limit: PAGE_LIMIT,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch standard and curated collection details.
  useEffect(() => {
    let active = true;

    const fetchCollectionData = async () => {
      try {
        const [categoryResponse, uniqueResponse] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/unique-categories`),
        ]);

        if (!active) return;

        const categories = Array.isArray(categoryResponse.data?.categories)
          ? categoryResponse.data.categories
          : [];

        const uniqueCategories = Array.isArray(
          uniqueResponse.data?.categories
        )
          ? uniqueResponse.data.categories
          : Array.isArray(uniqueResponse.data?.uniqueCategories)
            ? uniqueResponse.data.uniqueCategories
            : [];

        setCategoryData(
          categories.find((item) => item.slug === category) || null
        );

        setUniqueCategoryData(
          uniqueCategories.find((item) => item.slug === category) || null
        );
      } catch (err) {
        console.error("Failed to fetch collection data:", err);

        if (active) {
          setCategoryData(null);
          setUniqueCategoryData(null);
        }
      }
    };

    if (category) fetchCollectionData();

    return () => {
      active = false;
    };
  }, [category]);

  // Fetch products with sorting, filtering and pagination.
  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.append(
          uniqueCategoryData ? "uniqueCategory" : "category",
          category
        );
        params.append("sort", sortOption);
        params.append("page", String(page));
        params.append("limit", String(PAGE_LIMIT));
        params.append("minPrice", String(appliedMinPrice));
        params.append("maxPrice", String(appliedMaxPrice));

        const { data } = await axios.get(
          `${API_URL}/products?${params.toString()}`
        );

        if (!active) return;

        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            totalProducts: 0,
            totalPages: 1,
            currentPage: 1,
            limit: PAGE_LIMIT,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        if (!active) return;

        console.error("Failed to fetch products:", err);
        setProducts([]);
        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    if (category) fetchProducts();

    return () => {
      active = false;
    };
  }, [
    category,
    uniqueCategoryData,
    sortOption,
    page,
    appliedMinPrice,
    appliedMaxPrice,
  ]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  const handleSortChange = (value) => {
    setSortOption(value);
    setSortOpen(false);
    setPage(1);
  };

  const applyPriceFilter = () => {
    let min = Number(minPrice);
    let max = Number(maxPrice);

    if (!Number.isFinite(min)) min = DEFAULT_MIN_PRICE;
    if (!Number.isFinite(max)) max = DEFAULT_MAX_PRICE;

    min = Math.max(0, min);
    max = Math.max(min, max);

    setMinPrice(min);
    setMaxPrice(max);
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const clearPriceFilter = () => {
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setAppliedMinPrice(DEFAULT_MIN_PRICE);
    setAppliedMaxPrice(DEFAULT_MAX_PRICE);
    setPage(1);
  };

  const clearAllFilters = () => {
    clearPriceFilter();
    setSortOption("best-selling");
    setPage(1);
  };

  const collectionData = uniqueCategoryData || categoryData;

  const categoryTitle =
    collectionData?.name ||
    `${category
      ?.split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} Sarees`;

  const seoTitle = (() => {
    if (uniqueCategoryData) {
      const titles = {
        "cotton-elegance": "Cotton Saree Collection",
        "silk-heritage": "Silk Saree Collection",
        "festive-glow": "Festive Saree Collection",
        "modern-tradition": "Traditional & Contemporary Sarees",
        "royal-weaves": "Premium Saree Collection",
      };

      return titles[category]
        ? `${titles[category]} | Mehaa Garments`
        : `${categoryTitle} | Saree Collection | Mehaa Garments`;
    }

    const titles = {
      "cotton-sarees": "Buy Cotton Sarees Online",
      "silk-sarees": "Shop Silk Sarees Online",
      "designer-sarees": "Shop Designer Sarees Online",
      "daily-wear": "Daily Wear Sarees Online",
    };

    return titles[category]
      ? `${titles[category]} | Mehaa Garments`
      : `${categoryTitle} | Shop Sarees Online | Mehaa Garments`;
  })();

  const seoDescription = uniqueCategoryData
    ? `Explore the ${categoryTitle} collection at Mehaa Garments. Discover beautiful sarees for celebrations, traditional occasions and everyday elegance.`
    : `Explore ${categoryTitle} at Mehaa Garments. Shop sarees online and discover beautiful styles for everyday wear, celebrations and special occasions.`;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonicalUrl: `https://www.mehaagarments.in/collections/${category}`,
  });

  const categoryImage =
    collectionData?.image ||
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c";

  const priceFilterActive =
    appliedMinPrice !== DEFAULT_MIN_PRICE ||
    appliedMaxPrice !== DEFAULT_MAX_PRICE;

  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ||
    "Best Selling";

  const openProduct = (id) =>
    navigate(`/collection/${category}/specification/${id}`);

  const scrollToProducts = () => {
    document.getElementById("collection-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Shared filter content for desktop and mobile.
  const renderFilters = () => (
    <div className="space-y-0">
      <div className="border-b border-[#e9e1d6] py-5">
        <button
          type="button"
          onClick={() => setAvailabilityOpen(!availabilityOpen)}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={availabilityOpen}
        >
          <span className="text-[13px] font-medium uppercase tracking-[1.5px]">
            Availability
          </span>
          <ChevronDown
            size={17}
            className={`transition-transform duration-300 ${
              availabilityOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {availabilityOpen && (
          <p className="mt-4 text-sm text-[#777168]">
            {pagination.totalProducts}{" "}
            {pagination.totalProducts === 1 ? "piece" : "pieces"} in this
            collection
          </p>
        )}
      </div>

      <div className="py-5">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={priceOpen}
        >
          <span className="text-[13px] font-medium uppercase tracking-[1.5px]">
            Price range
          </span>
          <ChevronDown
            size={17}
            className={`transition-transform duration-300 ${
              priceOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {priceOpen && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[#777168]">
              <span>{formatPrice(minPrice)}</span>
              <span>{formatPrice(maxPrice)}</span>
            </div>

            <input
              aria-label="Maximum price"
              type="range"
              min={250}
              max={50000}
              step={250}
              value={Math.min(50000, Math.max(250, maxPrice))}
              onChange={(event) =>
                setMaxPrice(Math.max(minPrice, Number(event.target.value)))
              }
              className="mt-3 w-full cursor-pointer accent-[#356b55]"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-wider text-[#8a8378]">
                  Minimum
                </span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#e5ded3] bg-[#fffdfa] px-3 py-3 text-sm outline-none transition focus:border-[#356b55]"
                  placeholder="₹250"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-wider text-[#8a8378]">
                  Maximum
                </span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#e5ded3] bg-[#fffdfa] px-3 py-3 text-sm outline-none transition focus:border-[#356b55]"
                  placeholder="₹50,000"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={applyPriceFilter}
              className="mt-5 w-full rounded-full bg-[#244a3a] px-5 py-3.5 text-xs font-medium uppercase tracking-[1.5px] text-white transition-colors hover:bg-[#18382b]"
            >
              Apply price
            </button>

            {priceFilterActive && (
              <button
                type="button"
                onClick={clearPriceFilter}
                className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-xs text-[#777168] transition hover:text-[#244a3a]"
              >
                <RotateCcw size={13} />
                Reset price
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderProductCard = (item) => {
    const discount =
      item.oldPrice > item.price
        ? Math.round(
            ((item.oldPrice - item.price) / item.oldPrice) * 100
          )
        : 0;

    return (
      <article
        key={item._id}
        role="link"
        tabIndex={0}
        aria-label={`View ${item.name}`}
        onClick={() => openProduct(item._id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProduct(item._id);
          }
        }}
        className="group min-w-0 cursor-pointer outline-none"
      >
        <div className="relative aspect-3/4 overflow-hidden bg-[#eee8de]">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />

          {discount > 0 && (
            <span className="absolute left-2 top-2 bg-[#f8f3eb] px-2 py-1 text-[9px] font-medium uppercase tracking-[1px] text-[#356b55] sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]">
              {discount}% off
            </span>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openProduct(item._id);
            }}
            className="absolute bottom-0 left-0 right-0 hidden translate-y-full bg-[#f8f3eb]/95 px-4 py-4 text-center text-[10px] font-medium uppercase tracking-[2px] text-[#263b30] backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0 md:block"
          >
            Explore saree <ArrowRight size={14} className="ml-2 inline" />
          </button>
        </div>

        <div className="pt-3 sm:pt-4">
          <h3 className="line-clamp-2 font-serif text-[14px] leading-snug text-[#292821] sm:text-[17px]">
            {item.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[15px] font-medium text-[#356b55] sm:text-[17px]">
              {formatPrice(item.price)}
            </span>

            {item.oldPrice > item.price && (
              <span className="text-[11px] text-[#9b948a] line-through sm:text-[13px]">
                {formatPrice(item.oldPrice)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="mt-1 text-[10px] text-[#8a8378] sm:text-[11px]">
              You save {formatPrice(item.oldPrice - item.price)}
            </p>
          )}
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#292821]">
      {/* COLLECTION HERO */}
      <section className="relative isolate flex min-h-97.5 h-[52svh] max-h-170 items-center justify-center overflow-hidden sm:min-h-112.5">
        <img
          src={categoryImage}
          alt={categoryTitle}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/35 via-black/35 to-black/60" />

        <div className="mx-auto max-w-4xl px-5 py-12 text-center text-white sm:px-8">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-[#d8c3a0]" />
            <p className="text-[10px] font-medium uppercase tracking-[4px] text-white/90 sm:text-xs sm:tracking-[6px]">
              MEHAA GARMENTS
            </p>
            <span className="h-px w-7 bg-[#d8c3a0]" />
          </div>

          <h1 className="font-serif text-4xl font-normal leading-[1.12] tracking-tight sm:text-6xl md:text-7xl">
            {categoryTitle}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/85 sm:mt-6 sm:text-base sm:leading-8">
            {collectionData?.description ||
              "Discover timeless drapes, beautiful details and effortless Indian elegance."}
          </p>

          <button
            type="button"
            onClick={scrollToProducts}
            className="mt-7 inline-flex items-center gap-3 border border-white/75 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[2px] transition-all duration-300 hover:border-[#f3e3c6] hover:bg-[#f3e3c6] hover:text-[#263b30] sm:mt-9 sm:px-8 sm:py-4"
          >
            Discover the collection
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[9px] uppercase tracking-[3px] text-white/70 sm:flex">
          <Sparkles size={12} />
          Timeless by tradition
        </div>
      </section>

      {/* COLLECTION CONTENT */}
      <section
        id="collection-products"
        className="mx-auto max-w-400 scroll-mt-5 px-3 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16"
      >
        {/* Collection heading */}
        <div className="mb-7 border-b border-[#e9e1d6] pb-6 sm:mb-9 sm:pb-8">
          <p className="mb-2 text-[9px] uppercase tracking-[3px] text-[#8a8378] sm:text-[10px]">
            THE MEHAA COLLECTION JOURNAL
          </p>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-3xl font-normal leading-tight sm:text-4xl">
                Explore the edit
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#827b70] sm:text-sm">
                Thoughtfully chosen sarees for every beautiful occasion.
              </p>
            </div>

            <span className="hidden text-[10px] uppercase tracking-[2px] text-[#827b70] lg:block">
              A little tradition, a lot of elegance
            </span>
          </div>
        </div>

        {/* Mobile filter / sort toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3 border-y border-[#e9e1d6] py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 py-2 text-[10px] font-medium uppercase tracking-[1.5px]"
          >
            <SlidersHorizontal size={15} />
            Filters
            {priceFilterActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#356b55]" />
            )}
          </button>

          <span className="text-[11px] text-[#827b70]">
            {loading ? "Loading..." : `${pagination.totalProducts} sarees`}
          </span>

          <button
            type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className="inline-flex items-center gap-2 py-2 text-[10px] font-medium uppercase tracking-[1.2px]"
          >
            <ArrowUpDown size={14} />
            Sort
          </button>
        </div>

        {/* Mobile sort menu */}
        {sortOpen && (
          <div className="relative z-20 mb-5 -mt-3 border border-[#e9e1d6] bg-white p-2 shadow-lg md:hidden">
            {SORT_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs ${
                  sortOption === option.value
                    ? "bg-[#f3f0e8] text-[#356b55]"
                    : "text-[#555047]"
                }`}
              >
                {option.label}
                {sortOption === option.value && (
                  <span className="text-[10px]">Selected</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <div className="sticky top-24 border border-[#e9e1d6] bg-[#fffdfa] px-5 py-6 lg:px-6">
              <div className="flex items-center justify-between border-b border-[#e9e1d6] pb-5">
                <h2 className="font-serif text-2xl">Refine</h2>
                <SlidersHorizontal size={17} strokeWidth={1.4} />
              </div>

              {renderFilters()}

              {priceFilterActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[1.3px] text-[#827b70] hover:text-[#356b55]"
                >
                  <RotateCcw size={12} />
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0">
            <div className="mb-6 hidden items-center justify-between border-b border-[#e9e1d6] pb-4 md:flex">
              <p className="text-xs text-[#827b70]">
                {loading
                  ? "Curating your collection..."
                  : `Showing ${products.length} of ${pagination.totalProducts} sarees`}
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex min-w-51.25 items-center justify-between gap-4 border border-[#e9e1d6] bg-[#fffdfa] px-4 py-3 text-xs transition hover:border-[#b9c9bb]"
                  aria-expanded={sortOpen}
                >
                  <span>
                    <span className="text-[#827b70]">Sort: </span>
                    {selectedSort}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-full border border-[#e9e1d6] bg-[#fffdfa] p-1 shadow-xl">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full px-4 py-3 text-left text-xs transition ${
                          sortOption === option.value
                            ? "bg-[#f1eee6] text-[#356b55]"
                            : "hover:bg-[#f8f5ef]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 xl:grid-cols-3 xl:gap-x-7">
                {Array.from({ length: PAGE_LIMIT }).map((_, index) => (
                  <div key={index} className="min-w-0 animate-pulse">
                    <div className="aspect-3/4 bg-[#ece6dc]" />
                    <div className="mt-4 h-4 w-4/5 bg-[#ece6dc]" />
                    <div className="mt-3 h-4 w-2/5 bg-[#ece6dc]" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="border border-[#e9e1d6] bg-[#fffdfa] px-5 py-20 text-center">
                <h2 className="font-serif text-3xl">A little pause</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#827b70]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-7 bg-[#244a3a] px-7 py-3.5 text-[10px] uppercase tracking-[2px] text-white transition hover:bg-[#18382b]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="border border-[#e9e1d6] bg-[#fffdfa] px-5 py-20 text-center">
                <Sparkles
                  size={25}
                  strokeWidth={1.2}
                  className="mx-auto text-[#8a9b82]"
                />
                <h2 className="mt-5 font-serif text-3xl">
                  Nothing in this edit just yet
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#827b70]">
                  Try adjusting your price range to discover more beautiful
                  sarees in this collection.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-7 bg-[#244a3a] px-7 py-3.5 text-[10px] uppercase tracking-[2px] text-white transition hover:bg-[#18382b]"
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* Responsive product grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 xl:grid-cols-3 xl:gap-x-7">
                {products.map((item) => renderProductCard(item))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <nav
                aria-label="Collection pagination"
                className="mt-12 flex items-center justify-center gap-4 border-t border-[#e9e1d6] pt-7 sm:mt-16 sm:gap-6"
              >
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => {
                    setPage((previous) => Math.max(previous - 1, 1));
                    document
                      .getElementById("collection-products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className="border border-[#dcd5ca] px-4 py-3 text-[9px] uppercase tracking-[1px] transition hover:bg-[#244a3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-6 sm:text-[10px]"
                >
                  Previous
                </button>

                <span className="font-serif text-lg text-[#356b55]">
                  {pagination.currentPage}
                  <span className="mx-2 text-[#aaa195]">/</span>
                  {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => {
                    setPage((previous) =>
                      Math.min(previous + 1, pagination.totalPages)
                    );
                    document
                      .getElementById("collection-products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  }}
                  className="border border-[#dcd5ca] px-4 py-3 text-[9px] uppercase tracking-[1px] transition hover:bg-[#244a3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-6 sm:text-[10px]"
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-100 md:hidden"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/45"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute bottom-0 left-0 right-0 max-h-[85svh] overflow-y-auto rounded-t-2xl bg-[#faf8f4] px-5 pb-8 pt-5"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[#e9e1d6] pb-5">
              <div>
                <p className="text-[9px] uppercase tracking-[2px] text-[#827b70]">
                  MEHAA GARMENTS
                </p>
                <h2
                  id="mobile-filter-title"
                  className="mt-1 font-serif text-2xl"
                >
                  Refine your edit
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-[#e1d9cd] p-2.5"
              >
                <X size={18} />
              </button>
            </div>

            {renderFilters()}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="border border-[#dcd5ca] py-4 text-[10px] uppercase tracking-[1.3px]"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={applyPriceFilter}
                className="bg-[#244a3a] py-4 text-[10px] uppercase tracking-[1.3px] text-white"
              >
                Show {pagination.totalProducts} sarees
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default CollectionPage;
