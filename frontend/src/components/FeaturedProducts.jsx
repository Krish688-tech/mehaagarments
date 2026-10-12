import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

const FeaturedProducts = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const productsRef = useRef([]);

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FETCH FEATURED PRODUCTS
  // ================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `${API_URL}/products?sort=best-selling&page=1&limit=6`,
        );

        setProducts(
          Array.isArray(data.products) ? data.products.slice(0, 6) : [],
        );
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setError("Unable to load our featured collection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ================================
  // GSAP ANIMATION
  // ================================
  useEffect(() => {
    if (loading || products.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        productsRef.current.filter(Boolean),
        {
          y: 70,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [loading, products]);

  // ================================
  // PRODUCT NAVIGATION
  // ================================
  const handleProductClick = (product) => {
    if (!product?._id) return;

    const category = product.category;

    if (!category) {
      console.warn("Product category is missing:", product);
      return;
    }

    navigate(`/collection/${category}/specification/${product._id}`);
  };

  // ================================
  // VIEW ALL
  // ================================
  const handleViewAll = () => {
    navigate("/shop");
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <section className="bg-white px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center md:mb-20">
            <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-gray-200" />
            <div className="mx-auto mt-5 h-10 w-72 animate-pulse rounded bg-gray-200 md:h-14 md:w-96" />
            <div className="mx-auto mt-5 h-4 w-80 animate-pulse rounded bg-gray-200 md:w-105" />
          </div>

          <div className="grid gap-x-5 gap-y-12 grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item}>
                <div className="aspect-4/5 animate-pulse rounded-3xl bg-gray-100" />
                <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ================================
  // ERROR
  // ================================
  if (error) {
    return (
      <section className="bg-white px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">
            Mehaa Garments
          </p>

          <h2 className="mt-5 text-3xl font-light text-gray-900 md:text-5xl">
            The Mehaa Edit
          </h2>

          <p className="mt-5 text-sm text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  // ================================
  // EMPTY
  // ================================
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="bg-white px-5 pt-8 pb-20 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* ================================
            SECTION HEADER
        ================================= */}
        <div ref={headingRef} className="relative mb-10 md:mb-20">
          {/* ================================
              FEATURED PRODUCTS INTRO
          ================================= */}
          <div className="w-full text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-[#777]">
              The Mehaa Edit
            </p>

            <h2 className="mt-4 text-4xl font-light tracking-[-0.03em] text-[#1d1d1d] md:text-6xl lg:text-7xl">
              Signature Sarees
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 md:text-base">
              A considered selection of timeless sarees, chosen for their
              beauty, craftsmanship and effortless elegance.
            </p>
          </div>

          {/* EXISTING CTA — NAVIGATION UNCHANGED */}
          <div className="mt-7 flex justify-center md:absolute md:bottom-0 md:right-0 md:mt-0">
            <button
              onClick={handleViewAll}
              className="group flex w-fit items-center gap-3 border-b border-black/20 pb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#222] transition-colors hover:border-black"
            >
              View All Sarees
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        {/* ================================
            PRODUCTS
        ================================= */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16 lg:grid-cols-3">
          {products.map((product, index) => {
            const price = Number(product.price || 0);
            const oldPrice = Number(product.oldPrice || 0);

            const discount =
              oldPrice > price
                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                : 0;

            const rating = Number(product.rating || 0);

            return (
              <article
                key={product._id}
                ref={(el) => {
                  productsRef.current[index] = el;
                }}
                onClick={() => handleProductClick(product)}
                className="group cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden rounded-3xl bg-[#f6f4f1]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="aspect-4/5 w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-4/5 items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}

                  {/* DISCOUNT */}
                  {discount > 0 && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-gray-700 backdrop-blur-md md:left-5 md:top-5">
                      {discount}% Off
                    </span>
                  )}

                  {/* OUT OF STOCK */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="rounded-full bg-white/95 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* HOVER ACTION */}
                  <div className="absolute bottom-4 right-4 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg md:h-12 md:w-12">
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium tracking-wide text-[#222] md:text-base">
                        {product.name}
                      </h3>

                      {product.category && (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                          {product.category.replace(/-/g, " ")}
                        </p>
                      )}
                    </div>

                    {rating > 0 && (
                      <div className="hidden shrink-0 items-center gap-1 text-[10px] text-gray-500 sm:flex">
                        <Star size={11} fill="currentColor" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-[#222] md:text-base">
                      ₹{price.toLocaleString("en-IN")}
                    </span>

                    {oldPrice > price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{oldPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* MOBILE VIEW */}
                  <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-gray-500 sm:hidden">
                    View Saree
                    <ArrowUpRight size={12} strokeWidth={1.5} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ================================
            BOTTOM CTA
        ================================= */}
        <div className="mt-16 flex justify-center md:mt-20">
          <button
            onClick={handleViewAll}
            className="group flex items-center gap-4 rounded-full border border-black/20 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-black hover:text-white"
          >
            Explore All Sarees
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
