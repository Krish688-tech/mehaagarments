
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import initialCategories from "../data/categories.js";

gsap.registerPlugin(ScrollTrigger);

const Categories = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  // Render category content immediately from the frontend.
  const [categories, setCategories] = useState(initialCategories);

  // Refresh backend data without blocking the initial render.
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/categories`,
          { timeout: 8000 },
        );

        if (cancelled || !Array.isArray(data.categories)) return;

        const backendCategories = data.categories
          .filter((cat) => cat.isActive !== false)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        // Keep local image URLs for known categories.
        // Backend remains the source for updated category data.
        const localBySlug = new Map(
          initialCategories.map((cat) => [cat.slug, cat]),
        );

        const refreshedCategories = backendCategories.map((cat) => ({
          ...cat,
          image: localBySlug.get(cat.slug)?.image || cat.image,
        }));

        // Keep the initial categories if the API returns no usable items.
        if (refreshedCategories.length > 0) {
          setCategories(refreshedCategories);
        }
      } catch (error) {
        // The frontend categories remain visible if the backend is slow.
        console.error("Category refresh failed:", error);
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Animate cards after the initial frontend render.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      if (!cards.length) return;

      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [categories]);

  return (
    <section
      ref={sectionRef}
      id="collections"
      className="bg-[#faf9f7] px-5 pt-20 pb-8 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center md:mb-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-[#777]">
            The Mehaa Collection
          </p>

          <h2 className="mt-5 text-4xl font-light tracking-[-0.03em] text-[#1d1d1d] md:text-6xl lg:text-7xl">
            Discover Your Drape
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-500 md:text-base">
            Curated sarees for every occasion, thoughtfully chosen to bring
            timeless elegance into every drape.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((cat, i) => (
            <div
              key={cat._id || cat.slug}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              onClick={() => navigate(`/collections/${cat.slug}`)}
              className="group relative cursor-pointer overflow-hidden rounded-4xl bg-gray-100"
            >
              <div className="relative h-105 w-full overflow-hidden md:h-135">
                <img
                  src={cat.image}
                  alt={cat.name}
                  width="800"
                  height="1080"
                  loading={i < 2 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] md:object-contain"
                />
              </div>

              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent transition-all duration-500 group-hover:from-black/75" />

              <div className="absolute left-6 top-6 md:left-8 md:top-8">
                <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
                  Collection
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <h3 className="text-3xl font-light tracking-tight text-white md:text-4xl">
                      {cat.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-3 overflow-hidden">
                      <span className="translate-y-2 text-xs uppercase tracking-[0.2em] text-white/80 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore Collection
                      </span>

                      <span className="h-px w-8 bg-white/70 opacity-0 transition-all duration-700 group-hover:w-14 group-hover:opacity-100" />
                    </div>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-white group-hover:text-black md:h-14 md:w-14">
                    <ArrowUpRight
                      size={21}
                      strokeWidth={1.5}
                      className="transition-transform duration-500 group-hover:rotate-6"
                    />
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-4xl border border-white/0 transition-all duration-500 group-hover:border-white/30" />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-black/10 pt-6 md:flex-row">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Timeless • Elegant • Mehaa
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="group flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#222]"
          >
            View All Collections
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 transition-all duration-300 group-hover:bg-black group-hover:text-white">
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;
