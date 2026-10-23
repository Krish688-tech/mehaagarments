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
          className="mt-8 cursor-pointer rounded-full bg-linear-to-r from-pink-400 via-pink-500 to-pink-600 px-8 py-3 font-medium text-white shadow-lg transition-transform hover:scale-105"
        >
          Explore Collection
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
