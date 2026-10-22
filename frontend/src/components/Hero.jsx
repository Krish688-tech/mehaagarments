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
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const marqueeTrackRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        imageRef.current,
        { scale: 1.2 },
        { scale: 1, duration: 2, ease: "power3.out" }
      )
        .fromTo(
          titleRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          "-=1.5"
        )
        .fromTo(
          subtitleRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          "-=0.8"
        )
        .fromTo(
          buttonRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.6"
        );

      // Continuous marquee movement
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
      className="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden text-center"
    >
      {/* Background Image */}
      <img
        ref={imageRef}
        src="https://res.cloudinary.com/dkp7rlfq4/image/upload/f_auto,q_auto:good,w_1280/v1777964626/Mehaa_Garments_tkwlvf.png"
        srcSet="
          https://res.cloudinary.com/dkp7rlfq4/image/upload/f_auto,q_auto:good,w_640/v1777964626/Mehaa_Garments_tkwlvf.png 640w,
          https://res.cloudinary.com/dkp7rlfq4/image/upload/f_auto,q_auto:good,w_1280/v1777964626/Mehaa_Garments_tkwlvf.png 1280w,
          https://res.cloudinary.com/dkp7rlfq4/image/upload/f_auto,q_auto:good,w_1920/v1777964626/Mehaa_Garments_tkwlvf.png 1920w
        "
        sizes="100vw"
        alt="Mehaa Garments saree collection"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        width="1920"
        height="1080"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 px-6 text-white">
        <h1
          ref={titleRef}
          className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        >
          Elegance in Every Saree
        </h1>

        <p
          ref={subtitleRef}
          className="mt-4 text-base sm:text-lg md:text-xl"
        >
          Discover timeless tradition with modern style
        </p>

        <button
          ref={buttonRef}
          onClick={() => navigate("/shop")}
          className="mt-8 cursor-pointer rounded-full bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 px-8 py-3 font-medium text-white shadow-lg transition-transform hover:scale-105"
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
