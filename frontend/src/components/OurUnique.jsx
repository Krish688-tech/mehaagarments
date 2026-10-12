import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const uniqueCategories = [
  {
    id: "cotton-elegance",
    image: "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778074828/download_5_jwoaml.jpg",
    slug: "cotton-elegance",
    title: "Cotton Elegance",
    description: "Lightweight sarees perfect for everyday comfort and graceful styling.",
  },
  {
    id: "silk-heritage",
    image: "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778074826/download_4_upyrrc.jpg",
    slug: "silk-heritage",
    title: "Silk Heritage",
    description: "Rich silk sarees crafted for timeless celebrations and special occasions.",
  },
  {
    id: "festive-glow",
    image: "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778074832/orange_pattu_saree_mzmoih.jpg",
    slug: "festive-glow",
    title: "Festive Glow",
    description: "Vibrant sarees that bring colour, elegance and life to every occasion.",
  },
  {
    id: "modern-tradition",
    image: "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778074832/indianfashion_trdacj.jpg",
    slug: "modern-tradition",
    title: "Modern Tradition",
    description: "Contemporary styles inspired by timeless Indian craftsmanship.",
  },
  {
    id: "royal-weaves",
    image: "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778074825/Maheshwari_silk_saree_with_stitched_blouse_-_Green___Maheshwari_silk_arrdgs.jpg",
    slug: "royal-weaves",
    title: "Royal Weaves",
    description: "Premium handcrafted sarees featuring rich textures and intricate detailing.",
  },
];

const OurUnique = () => {
  const sectionRef = useRef(null);
  const slidesRef = useRef([]);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const slides = slidesRef.current.filter(Boolean);

      if (!slides.length) return;

      /* ------------------------------------------
         INITIAL SLIDE STATES
      ------------------------------------------ */

      slides.forEach((slide, index) => {
        const content = slide.querySelector(".slide-content");

        if (index === 0) {
          gsap.set(slide, {
            xPercent: 0,
            opacity: 1,
          });

          gsap.set(content, {
            y: 0,
            opacity: 1,
          });
        } else {
          gsap.set(slide, {
            xPercent: 100,
            opacity: 0,
          });

          gsap.set(content, {
            y: 40,
            opacity: 0,
          });
        }
      });

      /* ------------------------------------------
         MAIN SLIDE TIMELINE
      ------------------------------------------ */

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${slides.length * 100}%`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      slides.forEach((slide, index) => {
        if (index === 0) return;

        const content = slide.querySelector(".slide-content");

        timeline.to(
          slide,
          {
            xPercent: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
          }
        );

        timeline.to(
          content,
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.55"
        );
      });

      ScrollTrigger.refresh();
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleCategoryClick = (slug) => {
    navigate(`/collections/${slug}`);
  };

  return (
    <div className="w-full bg-white">

      {/* =====================================================
          SECTION INTRO
      ===================================================== */}

      <section className="relative w-full bg-white px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl text-center">

          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.45em] text-gray-500 md:text-xs">
            Mehaa Garments
          </p>

          <h2 className="text-4xl font-light tracking-tight text-[#1f1f1f] md:text-6xl">
            Our Unique Collections
          </h2>

          <div className="mx-auto mt-6 h-px w-12 bg-gray-400 md:mt-7" />

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-gray-500 md:text-base md:leading-8">
            Discover our specially curated collections, where timeless Indian
            craftsmanship meets contemporary elegance.
          </p>

        </div>
      </section>


      {/* =====================================================
          GSAP PINNED COLLECTION SECTION
      ===================================================== */}

      <section
        ref={sectionRef}
        className="relative h-svh w-full overflow-hidden bg-black"
      >

        {uniqueCategories.map((category, index) => (
          <div
            key={category.id}
            ref={(element) => {
              slidesRef.current[index] = element;
            }}
            className="absolute inset-0 h-full w-full"
            style={{ zIndex: index }}
          >

            <div
              className="group relative h-full w-full cursor-pointer"
              onClick={() => handleCategoryClick(category.slug)}
            >

              {/* IMAGE */}

              <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-2000 ease-out group-hover:scale-105"
              />

              {/* DARK OVERLAY */}

              <div className="absolute inset-0 bg-black/35 transition-all duration-700 group-hover:bg-black/45" />


              {/* CONTENT */}

              <div className="slide-content absolute inset-x-0 bottom-0 px-6 pb-12 text-white md:bottom-10 md:left-10 md:right-auto md:max-w-xl md:px-0 md:pb-10">

                <p className="mb-3 text-[10px] uppercase tracking-[0.4em] opacity-80 md:mb-4 md:text-sm">
                  Mehaa Garments
                </p>

                <h3 className="slide-title text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                  {category.title}
                </h3>

                <p className="slide-description mt-4 max-w-lg text-sm leading-6 opacity-85 md:mt-5 md:text-lg md:leading-8">
                  {category.description}
                </p>

                <div className="slide-button mt-6 inline-flex items-center gap-3 border-b border-white/70 pb-2 text-[10px] uppercase tracking-[0.25em] transition-all duration-500 group-hover:gap-5 md:mt-7 md:text-sm">
                  Explore Collection
                  <span className="text-base">→</span>
                </div>

              </div>

            </div>

          </div>
        ))}

      </section>

    </div>
  );
};

export default OurUnique;