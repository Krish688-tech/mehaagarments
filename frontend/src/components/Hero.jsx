import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const marqueeItems = [
  "OUR WEBSITE IS UNDER DEVELOPMENT",
  "A BEAUTIFUL SAREE SHOPPING EXPERIENCE IS COMING SOON",
  "STAY TUNED FOR OUR GRAND LAUNCH",
];

const Hero = () => {
  const imageRef = useRef(null);
  const marqueeTrackRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Keep the cinematic hero image zoom animation.
      gsap.fromTo(
        imageRef.current,
        { scale: 1.08 },
        { scale: 1, duration: 1.2, ease: "power2.out" },
      );

      // Continuous marquee movement.
      gsap.to(marqueeTrackRef.current, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  const repeatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <section
      id="home"
      className="relative flex h-screen min-h-150 items-center justify-center overflow-hidden text-center"
    >
      {/* Responsive Hero Background Image */}
      <picture className="absolute inset-0 h-full w-full">
        {/* Mobile Image */}
        <source
          media="(max-width: 767px)"
          srcSet="/mehaa-mobile-hero.webp"
          type="image/webp"
        />

        {/* Desktop and Tablet Image */}
        <img
          ref={imageRef}
          src="/mehaa-desktop-hero.webp"
          alt="Mehaa Garments saree collection"
          width="1920"
          height="1080"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
      {/* Hero Content */}
      <div className="relative z-10 px-6 text-white">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Elegance in Every Saree
        </h1>

        <p className="mt-4 text-base sm:text-lg md:text-xl">
          Discover timeless tradition with modern style
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="group relative mt-8 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-[#E6CC91]/70 bg-linear-to-r from-[#B88A3B] via-[#E7CC8C] to-[#B88A3B] px-8 py-3.5 font-semibold tracking-wide text-[#21170A] shadow-[0_6px_24px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,95,0.4)] active:translate-y-0"
        >
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative">Explore Collection</span>

          <svg
            className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17 17 7M7 7h10v10"
            />
          </svg>
        </button>
      </div>
      {/* Temporary Development Marquee */}
      <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-white/20 bg-black/40 py-3 backdrop-blur-sm sm:py-4">
        <div
          className="flex w-max"
          ref={marqueeTrackRef}
          aria-label="Our website is under development. A beautiful saree shopping experience is coming soon."
        >
          {repeatedItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-5 px-4 sm:gap-8 sm:px-8"
              aria-hidden="true"
            >
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white sm:text-xs sm:tracking-[0.25em]">
                {item}
              </span>

              <span className="text-sm text-[#e8c99c]" aria-hidden="true">
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
